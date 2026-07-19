import { beforeEach, describe, expect, mock, test } from 'bun:test'

const revalidatePath = mock(() => {})
const createPositionAssignment = mock(async () => ({ id: 'assignment-1' }))
const endPositionAssignment = mock(async (_id: string, _endsAt: Date) => ({ id: 'assignment-1' }))

class OrganizationOperationError extends Error {
  constructor(
    message: string,
    readonly options: { field?: string } = {},
  ) {
    super(message)
  }
  get field() {
    return this.options.field
  }
}

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/organization', () => ({
  OrganizationOperationError,
  organizationService: {
    positionAssignments: {
      create: createPositionAssignment,
      end: endPositionAssignment,
    },
  },
}))

const { createPositionAssignmentAction, endPositionAssignmentAction } = await import(
  '@/admin/position-assignment-management/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  createPositionAssignment.mockClear()
  endPositionAssignment.mockClear()
})

describe('admin Position Assignment management actions', () => {
  test('creates a Position Assignment from form data and revalidates the admin workflow', async () => {
    const formData = createAssignmentFormData({
      memberId: 'member-1',
      positionId: 'position-1',
      startsAt: '2026-01-01',
    })

    await expect(createPositionAssignmentAction({}, formData)).resolves.toEqual({
      message: 'Position Assignment added.',
    })
    expect(createPositionAssignment).toHaveBeenCalledWith({
      memberId: 'member-1',
      positionId: 'position-1',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/position-assignments')
  })

  test('ends a Position Assignment from form data and revalidates the admin workflow', async () => {
    const formData = new FormData()
    formData.set('endsAt', '2026-06-01')

    await expect(endPositionAssignmentAction('assignment-1', {}, formData)).resolves.toEqual({
      message: 'Position Assignment ended.',
    })
    expect(endPositionAssignment).toHaveBeenCalledWith('assignment-1', new Date('2026-06-01T00:00:00.000Z'))
    expect(revalidatePath).toHaveBeenCalledWith('/admin/position-assignments')
  })

  test('returns useful overlap and invalid period feedback', async () => {
    createPositionAssignment.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('This Position already has an assignment during that period.', {
        field: 'startsAt',
      })
    })
    endPositionAssignment.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('The end date must be after the start date.', {
        field: 'endsAt',
      })
    })

    await expect(
      createPositionAssignmentAction(
        {},
        createAssignmentFormData({
          memberId: 'member-1',
          positionId: 'position-1',
          startsAt: '2026-01-01',
        }),
      ),
    ).resolves.toEqual({
      message: 'This Position already has an assignment during that period.',
      fieldErrors: {
        startsAt: 'This Position already has an assignment during that period.',
      },
    })
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-01-01')
    await expect(endPositionAssignmentAction('assignment-1', {}, endFormData)).resolves.toEqual({
      message: 'The end date must be after the start date.',
      fieldErrors: {
        endsAt: 'The end date must be after the start date.',
      },
    })
  })
})

function createAssignmentFormData(input: { memberId: string; positionId: string; startsAt: string }) {
  const formData = new FormData()
  formData.set('memberId', input.memberId)
  formData.set('positionId', input.positionId)
  formData.set('startsAt', input.startsAt)
  return formData
}

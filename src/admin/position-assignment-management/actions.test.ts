import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { PositionAssignmentManagementValidationError } from '@/admin/position-assignment-management/service'
import type { AccessActor } from '@/lib/access-actor'

const revalidatePath = mock(() => {})
const listPositionAssignmentManagement = mock(async () => ({
  positions: [],
  members: [],
  positionViews: [],
  memberViews: [],
}))
const createPositionAssignment = mock(async () => ({ id: 'assignment-1' }))
const endPositionAssignment = mock(async () => ({ id: 'assignment-1' }))
const requireAdminSurfaceActor = mock(async () => actor)
const actor: AccessActor = { id: 'admin-user', role: 'admin' }

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/actor', () => ({
  getCurrentAccessActor: async () => actor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/position-assignment-management/runtime', () => ({
  getPositionAssignmentManagementService: async () => ({
    listPositionAssignmentManagement,
    createPositionAssignment,
    endPositionAssignment,
  }),
}))

const { createPositionAssignmentAction, endPositionAssignmentAction } = await import(
  '@/admin/position-assignment-management/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  listPositionAssignmentManagement.mockClear()
  createPositionAssignment.mockClear()
  endPositionAssignment.mockClear()
  requireAdminSurfaceActor.mockClear()
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
    expect(createPositionAssignment).toHaveBeenCalledWith(actor, {
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
    expect(endPositionAssignment).toHaveBeenCalledWith(actor, 'assignment-1', {
      endsAt: new Date('2026-06-01T00:00:00.000Z'),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/position-assignments')
  })

  test('returns useful overlap and invalid period feedback', async () => {
    createPositionAssignment.mockImplementationOnce(async () => {
      throw new PositionAssignmentManagementValidationError(
        'This Position already has an assignment during that period.',
        {
          startsAt: 'This Position already has an assignment during that period.',
        },
      )
    })
    endPositionAssignment.mockImplementationOnce(async () => {
      throw new PositionAssignmentManagementValidationError('The end date must be after the start date.', {
        endsAt: 'The end date must be after the start date.',
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

  test('rejects direct non-admin create and end action requests before service writes', async () => {
    requireAdminSurfaceActor.mockImplementation(async () => {
      throw new Error('Forbidden')
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
    ).rejects.toThrow('Forbidden')
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-06-01')
    await expect(endPositionAssignmentAction('assignment-1', {}, endFormData)).rejects.toThrow('Forbidden')
    expect(createPositionAssignment).not.toHaveBeenCalled()
    expect(endPositionAssignment).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

function createAssignmentFormData(input: { memberId: string; positionId: string; startsAt: string }) {
  const formData = new FormData()
  formData.set('memberId', input.memberId)
  formData.set('positionId', input.positionId)
  formData.set('startsAt', input.startsAt)
  return formData
}

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OrganizationOperationError } from '@/features/organization/core/errors'

const revalidatePath = mock(() => {})
const createPositionAssignment = mock(async () => ({ id: 'assignment-1' }))
const endPositionAssignment = mock(async (_id: string, _endsAt: Date) => ({ id: 'assignment-1' }))
const requireAdminActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermissionActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/core/auth/permissions.server', () => ({
  requireAdmin: requireAdminActor,
  requireCurrentUserPermission: requireCurrentUserPermissionActor,
}))
mock.module('@/core/logging', () => ({ audit: { adminActionCompleted, accountAccessChanged } }))

mock.module('@/features/organization', () => ({
  OrganizationOperationError,
  organizationService: {
    positionAssignments: {
      create: createPositionAssignment,
      end: endPositionAssignment,
    },
  },
}))

const { createPositionAssignmentAction, endPositionAssignmentAction } = await import(
  '@/features/organization/management/position-assignments/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  createPositionAssignment.mockClear()
  endPositionAssignment.mockClear()
  requireCurrentUserPermissionActor.mockClear()
  adminActionCompleted.mockClear()
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
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members/member-1')
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'positionAssignment.create',
      subject: { type: 'positionAssignment', id: 'assignment-1' },
    })
  })

  test('ends a Position Assignment from form data and revalidates the admin workflow', async () => {
    const formData = new FormData()
    formData.set('endsAt', '2026-06-01')
    formData.set('memberId', 'member-1')

    await expect(endPositionAssignmentAction('assignment-1', {}, formData)).resolves.toEqual({
      message: 'Position Assignment ended.',
    })
    expect(endPositionAssignment).toHaveBeenCalledWith('assignment-1', new Date('2026-06-01T00:00:00.000Z'))
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members/member-1')
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
      success: false,
      message: 'This Position already has an assignment during that period.',
      fieldErrors: {
        startsAt: 'This Position already has an assignment during that period.',
      },
    })
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-01-01')
    await expect(endPositionAssignmentAction('assignment-1', {}, endFormData)).resolves.toEqual({
      success: false,
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

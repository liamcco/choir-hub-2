import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OrganizationOperationError } from '@/features/organization/core/errors'

const revalidatePath = mock(() => {})
const startGroupMembership = mock(async () => ({ id: 'membership-1' }))
const endGroupMembership = mock(async (_id: string, _endsAt: Date) => ({ id: 'membership-1' }))
const requireCurrentUserPermission = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const adminActionCompleted = mock(() => {})

mock.module('next/cache', () => ({ revalidatePath }))
mock.module('@/core/auth/permissions.server', () => ({ requireCurrentUserPermission }))
mock.module('@/core/logging', () => ({ audit: { adminActionCompleted } }))
mock.module('@/features/organization', () => ({
  OrganizationOperationError,
  groupMembership: {
    start: startGroupMembership,
    end: endGroupMembership,
  },
  positionAssignment: {},
}))

const { createGroupMembershipAction, endGroupMembershipAction } = await import(
  '@/features/organization/management/group-memberships/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  startGroupMembership.mockClear()
  endGroupMembership.mockClear()
  requireCurrentUserPermission.mockClear()
  adminActionCompleted.mockClear()
})

describe('admin Group Membership management actions', () => {
  test('starts a Group Membership through the canonical write interface', async () => {
    const formData = new FormData()
    formData.set('userId', 'user-1')
    formData.set('groupId', 'tour-committee')

    await expect(createGroupMembershipAction({}, formData)).resolves.toEqual({
      success: true,
      message: 'Group Membership added.',
    })
    expect(startGroupMembership).toHaveBeenCalledWith({ userId: 'user-1', groupId: 'tour-committee' })
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'groupMembership.create',
      subject: { type: 'groupMembership', id: 'membership-1' },
    })
  })

  test('ends a Group Membership through the canonical write interface', async () => {
    const formData = new FormData()
    formData.set('endsAt', '2026-06-01')

    await expect(endGroupMembershipAction('membership-1', {}, formData)).resolves.toEqual({
      success: true,
      message: 'Group Membership ended.',
    })
    expect(endGroupMembership).toHaveBeenCalledWith('membership-1', new Date('2026-06-01T00:00:00.000Z'))
  })
})

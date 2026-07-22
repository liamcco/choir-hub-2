import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OrganizationOperationError } from '@/features/organization/core/errors'

const revalidatePath = mock(() => {})
const createGroupMembership = mock(async () => ({ id: 'membership-1' }))
const endGroupMembership = mock(async (_id: string, _endsAt: Date) => ({ id: 'membership-1' }))
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
    groupMemberships: {
      create: createGroupMembership,
      end: endGroupMembership,
    },
  },
}))

const { createGroupMembershipAction, endGroupMembershipAction } = await import(
  '@/features/organization/management/group-memberships/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  createGroupMembership.mockClear()
  endGroupMembership.mockClear()
  requireCurrentUserPermissionActor.mockClear()
  adminActionCompleted.mockClear()
})

describe('admin Group Membership management actions', () => {
  test('creates a Group Membership from form data and revalidates the admin workflow', async () => {
    const formData = createMembershipFormData({
      memberId: 'member-1',
      groupId: 'group-1',
    })

    await expect(createGroupMembershipAction({}, formData)).resolves.toEqual({
      success: true,
      message: 'Group Membership added.',
    })
    expect(createGroupMembership).toHaveBeenCalledWith({
      memberId: 'member-1',
      groupId: 'group-1',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'groupMembership.create',
      subject: { type: 'groupMembership', id: 'membership-1' },
    })
  })

  test('ends a Group Membership from form data and revalidates the admin workflow', async () => {
    const formData = new FormData()
    formData.set('endsAt', '2026-06-01')
    formData.set('groupId', 'group-1')
    formData.set('memberId', 'member-1')

    await expect(endGroupMembershipAction('membership-1', {}, formData)).resolves.toEqual({
      success: true,
      message: 'Group Membership ended.',
    })
    expect(endGroupMembership).toHaveBeenCalledWith('membership-1', new Date('2026-06-01T00:00:00.000Z'))
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
  })
})

function createMembershipFormData(input: { memberId: string; groupId: string }) {
  const formData = new FormData()
  formData.set('memberId', input.memberId)
  formData.set('groupId', input.groupId)
  return formData
}

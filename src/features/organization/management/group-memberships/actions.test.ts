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
      startsAt: '2026-01-01',
    })

    await expect(createGroupMembershipAction({}, formData)).resolves.toEqual({ message: 'Group Membership added.' })
    expect(createGroupMembership).toHaveBeenCalledWith({
      memberId: 'member-1',
      groupId: 'group-1',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups/group-1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members/member-1')
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
      message: 'Group Membership ended.',
    })
    expect(endGroupMembership).toHaveBeenCalledWith('membership-1', new Date('2026-06-01T00:00:00.000Z'))
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups/group-1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/members/member-1')
  })

  test('returns useful overlap and invalid period feedback', async () => {
    createGroupMembership.mockImplementationOnce(async () => {
      throw new OrganizationOperationError(
        'This Member already has a Group Membership in this Group during that period.',
        { field: 'startsAt' },
      )
    })
    endGroupMembership.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('The end date must be after the start date.', {
        field: 'endsAt',
      })
    })

    await expect(
      createGroupMembershipAction(
        {},
        createMembershipFormData({
          memberId: 'member-1',
          groupId: 'group-1',
          startsAt: '2026-01-01',
        }),
      ),
    ).resolves.toEqual({
      success: false,
      message: 'This Member already has a Group Membership in this Group during that period.',
      fieldErrors: {
        startsAt: 'This Member already has a Group Membership in this Group during that period.',
      },
    })
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-01-01')
    await expect(endGroupMembershipAction('membership-1', {}, endFormData)).resolves.toEqual({
      success: false,
      message: 'The end date must be after the start date.',
      fieldErrors: {
        endsAt: 'The end date must be after the start date.',
      },
    })
  })

  test('rejects invalid calendar date strings before mutating', async () => {
    await expect(
      createGroupMembershipAction(
        {},
        createMembershipFormData({
          memberId: 'member-1',
          groupId: 'group-1',
          startsAt: '2026-02-31',
        }),
      ),
    ).resolves.toEqual({
      success: false,
      fieldErrors: {
        startsAt: ['Start date is required.'],
      },
    })

    expect(createGroupMembership).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

function createMembershipFormData(input: { memberId: string; groupId: string; startsAt: string }) {
  const formData = new FormData()
  formData.set('memberId', input.memberId)
  formData.set('groupId', input.groupId)
  formData.set('startsAt', input.startsAt)
  return formData
}

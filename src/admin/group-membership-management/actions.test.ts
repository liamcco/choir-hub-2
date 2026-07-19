import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupMembershipManagementValidationError } from '@/admin/group-membership-management/service'
import type { AccessActor } from '@/lib/access-actor'

const revalidatePath = mock(() => {})
const listGroupMembershipManagement = mock(async () => ({ groups: [], members: [], groupViews: [], memberViews: [] }))
const createGroupMembership = mock(async () => ({ id: 'membership-1' }))
const endGroupMembership = mock(async () => ({ id: 'membership-1' }))
const requireAdminSurfaceActor = mock(async () => actor)
const actor: AccessActor = { id: 'admin-user', role: 'admin' }

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/shell/actor', () => ({
  getCurrentAccessActor: async () => actor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/group-membership-management/runtime', () => ({
  getGroupMembershipManagementService: async () => ({
    listGroupMembershipManagement,
    createGroupMembership,
    endGroupMembership,
  }),
}))

const { createGroupMembershipAction, endGroupMembershipAction } = await import(
  '@/admin/group-membership-management/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  listGroupMembershipManagement.mockClear()
  createGroupMembership.mockClear()
  endGroupMembership.mockClear()
  requireAdminSurfaceActor.mockClear()
})

describe('admin Group Membership management actions', () => {
  test('creates a Group Membership from form data and revalidates the admin workflow', async () => {
    const formData = createMembershipFormData({
      memberId: 'member-1',
      groupId: 'group-1',
      startsAt: '2026-01-01',
    })

    await expect(createGroupMembershipAction({}, formData)).resolves.toEqual({ message: 'Group Membership added.' })
    expect(createGroupMembership).toHaveBeenCalledWith(actor, {
      memberId: 'member-1',
      groupId: 'group-1',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/group-memberships')
  })

  test('ends a Group Membership from form data and revalidates the admin workflow', async () => {
    const formData = new FormData()
    formData.set('endsAt', '2026-06-01')

    await expect(endGroupMembershipAction('membership-1', {}, formData)).resolves.toEqual({
      message: 'Group Membership ended.',
    })
    expect(endGroupMembership).toHaveBeenCalledWith(actor, 'membership-1', {
      endsAt: new Date('2026-06-01T00:00:00.000Z'),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/group-memberships')
  })

  test('returns useful overlap and invalid period feedback', async () => {
    createGroupMembership.mockImplementationOnce(async () => {
      throw new GroupMembershipManagementValidationError(
        'This Member already has a Group Membership in this Group during that period.',
        {
          startsAt: 'This Member already has a Group Membership in this Group during that period.',
        },
      )
    })
    endGroupMembership.mockImplementationOnce(async () => {
      throw new GroupMembershipManagementValidationError('The end date must be after the start date.', {
        endsAt: 'The end date must be after the start date.',
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
      message: 'This Member already has a Group Membership in this Group during that period.',
      fieldErrors: {
        startsAt: 'This Member already has a Group Membership in this Group during that period.',
      },
    })
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-01-01')
    await expect(endGroupMembershipAction('membership-1', {}, endFormData)).resolves.toEqual({
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
      createGroupMembershipAction(
        {},
        createMembershipFormData({
          memberId: 'member-1',
          groupId: 'group-1',
          startsAt: '2026-01-01',
        }),
      ),
    ).rejects.toThrow('Forbidden')
    const endFormData = new FormData()
    endFormData.set('endsAt', '2026-06-01')
    await expect(endGroupMembershipAction('membership-1', {}, endFormData)).rejects.toThrow('Forbidden')
    expect(createGroupMembership).not.toHaveBeenCalled()
    expect(endGroupMembership).not.toHaveBeenCalled()
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

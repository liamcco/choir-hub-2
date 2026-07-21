import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { MemberStatus } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const redirect = mock(() => {})
const createLinkedAccount = mock(async () => ({ id: 'member-1' }))
const linkExistingUser = mock(async () => ({ id: 'user-1' }))
const updateMemberStatus = mock(async () => ({ id: 'member-1' }))
const updateAccountAccess = mock(async () => ({}))
const requireAdminActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermissionActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath,
}))
mock.module('next/navigation', () => ({ redirect }))

mock.module('@/core/auth/permissions.server', () => ({
  requireAdmin: requireAdminActor,
  requireCurrentUserPermission: requireCurrentUserPermissionActor,
}))
mock.module('@/core/logging', () => ({ audit: { adminActionCompleted, accountAccessChanged } }))

mock.module('@/features/organization/management/members/service', () => ({
  memberAccountService: {
    createLinkedAccount,
    linkExistingUser,
    updateMemberStatus,
    updateAccountAccess,
  },
}))

const { createLinkedMemberAction, createMemberAccountAction, updateAccountAccessAction, updateMemberStatusAction } =
  await import('@/features/organization/management/members/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  redirect.mockClear()
  createLinkedAccount.mockClear()
  linkExistingUser.mockClear()
  updateMemberStatus.mockClear()
  updateAccountAccess.mockClear()
  requireAdminActor.mockClear()
  requireCurrentUserPermissionActor.mockClear()
  adminActionCompleted.mockClear()
  accountAccessChanged.mockClear()
})

describe('admin Member management actions', () => {
  test('navigates successful creation directly to the new Member detail', async () => {
    await createMemberAccountAction(
      {},
      formData({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'correct horse battery staple',
        status: MemberStatus.ACTIVE,
      }),
    )

    expect(redirect).toHaveBeenCalledWith('/admin/members/member-1')
  })

  test('creates and updates Members from admin workflow forms', async () => {
    await createMemberAccountAction(
      {},
      formData({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'correct horse battery staple',
        status: MemberStatus.ACTIVE,
      }),
    )
    await createLinkedMemberAction('user-1', formData({ status: MemberStatus.PASSIVE }))
    await updateMemberStatusAction('member-1', formData({ status: MemberStatus.FORMER }))
    await updateAccountAccessAction('user-1', formData({ accessState: 'disabled' }))

    expect(createLinkedAccount).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse battery staple',
      status: MemberStatus.ACTIVE,
    })
    expect(linkExistingUser).toHaveBeenCalledWith('user-1', MemberStatus.PASSIVE)
    expect(updateMemberStatus).toHaveBeenCalledWith('member-1', MemberStatus.FORMER)
    expect(updateAccountAccess).toHaveBeenCalledWith('user-1', 'disabled')
    expect(accountAccessChanged).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'account.disabled',
      subjectUserId: 'user-1',
    })
  })
})

function formData(values: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) {
    form.set(key, value)
  }
  return form
}

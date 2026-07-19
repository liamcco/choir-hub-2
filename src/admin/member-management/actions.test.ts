import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { AccessActor } from '@/lib/access-actor'
import { MemberStatus } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const createMemberAccount = mock(async () => ({}))
const createLinkedMember = mock(async () => ({}))
const updateMemberStatus = mock(async () => ({}))
const updateAccountAccess = mock(async () => ({}))
const requireAdminSurfaceActor = mock(async () => actor)
const actor: AccessActor = { id: 'admin-user', role: 'admin' }

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/shell/actor', () => ({
  getCurrentAccessActor: async () => actor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/member-management/runtime', () => ({
  getMemberManagementService: async () => ({
    createMemberAccount,
    createLinkedMember,
    updateMemberStatus,
    updateAccountAccess,
  }),
}))

const { createLinkedMemberAction, createMemberAccountAction, updateAccountAccessAction, updateMemberStatusAction } =
  await import('@/admin/member-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  createMemberAccount.mockClear()
  createLinkedMember.mockClear()
  updateMemberStatus.mockClear()
  updateAccountAccess.mockClear()
  requireAdminSurfaceActor.mockClear()
})

describe('admin Member management actions', () => {
  test('creates and updates Members only after admin authorization', async () => {
    await createMemberAccountAction(
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

    expect(createMemberAccount).toHaveBeenCalledWith(actor, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse battery staple',
      status: MemberStatus.ACTIVE,
    })
    expect(createLinkedMember).toHaveBeenCalledWith(actor, {
      userId: 'user-1',
      status: MemberStatus.PASSIVE,
    })
    expect(updateMemberStatus).toHaveBeenCalledWith(actor, {
      memberId: 'member-1',
      status: MemberStatus.FORMER,
    })
    expect(updateAccountAccess).toHaveBeenCalledWith(actor, {
      userId: 'user-1',
      accessState: 'disabled',
    })
  })

  test('rejects direct non-admin action requests before service writes', async () => {
    requireAdminSurfaceActor.mockImplementation(async () => {
      throw new Error('Forbidden')
    })

    await expect(
      createMemberAccountAction(
        formData({
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'correct horse battery staple',
          status: MemberStatus.ACTIVE,
        }),
      ),
    ).rejects.toThrow('Forbidden')
    await expect(createLinkedMemberAction('user-1', formData({ status: MemberStatus.ACTIVE }))).rejects.toThrow(
      'Forbidden',
    )
    await expect(updateMemberStatusAction('member-1', formData({ status: MemberStatus.PASSIVE }))).rejects.toThrow(
      'Forbidden',
    )
    await expect(updateAccountAccessAction('user-1', formData({ accessState: 'disabled' }))).rejects.toThrow(
      'Forbidden',
    )

    expect(createMemberAccount).not.toHaveBeenCalled()
    expect(createLinkedMember).not.toHaveBeenCalled()
    expect(updateMemberStatus).not.toHaveBeenCalled()
    expect(updateAccountAccess).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

function formData(values: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) {
    form.set(key, value)
  }
  return form
}

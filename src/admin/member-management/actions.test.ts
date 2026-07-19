import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { MemberStatus } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const createMemberAccount = mock(async () => ({}))
const createLinkedMember = mock(async () => ({}))
const updateMemberStatus = mock(async () => ({}))
const updateAccountAccess = mock(async () => ({}))

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/member-management/service', () => ({
  createMemberAccount,
  createLinkedMember,
  updateMemberStatus,
  updateAccountAccess,
}))

const { createLinkedMemberAction, createMemberAccountAction, updateAccountAccessAction, updateMemberStatusAction } =
  await import('@/admin/member-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  createMemberAccount.mockClear()
  createLinkedMember.mockClear()
  updateMemberStatus.mockClear()
  updateAccountAccess.mockClear()
})

describe('admin Member management actions', () => {
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

    expect(createMemberAccount).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse battery staple',
      status: MemberStatus.ACTIVE,
    })
    expect(createLinkedMember).toHaveBeenCalledWith('user-1', MemberStatus.PASSIVE)
    expect(updateMemberStatus).toHaveBeenCalledWith('member-1', MemberStatus.FORMER)
    expect(updateAccountAccess).toHaveBeenCalledWith('user-1', 'disabled')
  })
})

function formData(values: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) {
    form.set(key, value)
  }
  return form
}

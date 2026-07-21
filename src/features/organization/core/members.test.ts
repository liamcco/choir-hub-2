import { beforeEach, describe, expect, mock, test } from 'bun:test'

const createMember = mock(async (args: unknown) => args)
const findMember = mock(async () => ({ id: 'member-1' }))
const updateMember = mock(async (args: unknown) => args)

mock.module('server-only', () => ({}))
mock.module('@/core/db', () => ({
  prisma: {
    member: {
      create: createMember,
      findUnique: findMember,
      update: updateMember,
    },
  },
}))

const { members } = await import('@/features/organization/core/members')

beforeEach(() => {
  createMember.mockClear()
})

describe('Members', () => {
  test('creates a Member with the Auth User ID as its ID', async () => {
    await members.create({ userId: 'auth-user-1', status: 'ACTIVE' })

    expect(createMember).toHaveBeenCalledWith({
      data: { id: 'auth-user-1', status: 'ACTIVE' },
    })
  })
})

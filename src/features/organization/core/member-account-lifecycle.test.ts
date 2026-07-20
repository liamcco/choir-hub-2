import { beforeEach, describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const { createMemberAccountLifecycle } = await import('@/features/organization/core/member-account-lifecycle')

const getRequestHeaders = mock(async () => new Headers())
const listAuthUsers = mock(async () => ({ users: [] }))
const createAuthUser = mock(async () => ({ user: { id: 'user-created' } }))
const removeAuthUser = mock(async () => ({}))
const banAuthUser = mock(async () => ({}))
const unbanAuthUser = mock(async () => ({}))
const listMembers = mock(async () => [])
const createMember = mock(async () => ({
  id: 'member-created',
  userId: 'user-created',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
}))
const updateMemberStatus = mock(async () => ({
  id: 'member-updated',
  userId: 'user-updated',
  status: 'FORMER',
  createdAt: new Date(),
  updatedAt: new Date(),
}))

const dependencies: Parameters<typeof createMemberAccountLifecycle>[0] = {
  getRequestHeaders: getRequestHeaders as Parameters<typeof createMemberAccountLifecycle>[0]['getRequestHeaders'],
  listAuthUsers: listAuthUsers as Parameters<typeof createMemberAccountLifecycle>[0]['listAuthUsers'],
  createAuthUser: createAuthUser as Parameters<typeof createMemberAccountLifecycle>[0]['createAuthUser'],
  removeAuthUser: removeAuthUser as Parameters<typeof createMemberAccountLifecycle>[0]['removeAuthUser'],
  banAuthUser: banAuthUser as Parameters<typeof createMemberAccountLifecycle>[0]['banAuthUser'],
  unbanAuthUser: unbanAuthUser as Parameters<typeof createMemberAccountLifecycle>[0]['unbanAuthUser'],
  listMembers: listMembers as Parameters<typeof createMemberAccountLifecycle>[0]['listMembers'],
  createMember: createMember as Parameters<typeof createMemberAccountLifecycle>[0]['createMember'],
  updateMemberStatus: updateMemberStatus as Parameters<typeof createMemberAccountLifecycle>[0]['updateMemberStatus'],
}

const lifecycle = createMemberAccountLifecycle(dependencies)

beforeEach(() => {
  getRequestHeaders.mockClear()
  listAuthUsers.mockClear()
  createAuthUser.mockClear()
  removeAuthUser.mockClear()
  banAuthUser.mockClear()
  unbanAuthUser.mockClear()
  listMembers.mockClear()
  createMember.mockClear()
  updateMemberStatus.mockClear()
  listAuthUsers.mockResolvedValue({ users: [] })
  createAuthUser.mockResolvedValue({ user: { id: 'user-created' } })
  createMember.mockResolvedValue({
    id: 'member-created',
    userId: 'user-created',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
})

describe('member account lifecycle', () => {
  test('projects linked and unlinked auth users through one lifecycle list', async () => {
    listAuthUsers.mockResolvedValue({
      users: [
        {
          id: 'user-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          banned: true,
          createdAt: '2026-01-02T03:04:05.000Z',
        },
        {
          id: 'user-2',
          name: 'Grace Hopper',
          email: 'grace@example.com',
          banned: false,
          createdAt: '2026-01-03T03:04:05.000Z',
        },
      ],
    })
    listMembers.mockResolvedValue([
      {
        id: 'member-1',
        userId: 'user-1',
        status: 'ACTIVE',
      },
    ])

    const accounts = await lifecycle.listManagedMembers()

    expect(accounts).toHaveLength(2)
    expect(accounts[0]).toMatchObject({
      linkState: 'linked',
      accessState: 'disabled',
      member: { id: 'member-1', userId: 'user-1', status: 'ACTIVE' },
    })
    expect(accounts[0].user.createdAt).toEqual(new Date('2026-01-02T03:04:05.000Z'))
    expect(accounts[1]).toMatchObject({
      linkState: 'unlinked',
      accessState: 'enabled',
      member: null,
      user: { id: 'user-2' },
    })
  })

  test('creates a linked account by creating auth user then member', async () => {
    await lifecycle.createMemberAccount({
      name: ' Ada Lovelace ',
      email: ' ADA@example.com ',
      password: 'correct horse battery staple',
      status: 'PASSIVE',
    })

    expect(createAuthUser).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'correct horse battery staple',
        role: 'user',
        data: { emailVerified: true },
      },
    })
    expect(createMember).toHaveBeenCalledWith({ userId: 'user-created', status: 'PASSIVE' })
  })

  test('removes created auth user when member creation fails', async () => {
    createMember.mockRejectedValue(new Error('member create failed'))

    await expect(
      lifecycle.createMemberAccount({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'correct horse battery staple',
        status: 'ACTIVE',
      }),
    ).rejects.toThrow('member create failed')

    expect(removeAuthUser).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { userId: 'user-created' },
    })
  })

  test('links an existing auth user by creating a member from the lifecycle interface', async () => {
    await lifecycle.createLinkedMember('user-9', 'FORMER')
    expect(createMember).toHaveBeenCalledWith({ userId: 'user-9', status: 'FORMER' })
  })

  test('updates member status through the lifecycle interface', async () => {
    await lifecycle.updateMemberStatus('member-7', 'FORMER')
    expect(updateMemberStatus).toHaveBeenCalledWith('member-7', 'FORMER')
  })

  test('updates account access through the lifecycle interface', async () => {
    await lifecycle.updateAccountAccess('user-3', 'disabled')
    await lifecycle.updateAccountAccess('user-3', 'enabled')

    expect(banAuthUser).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { userId: 'user-3', banReason: 'Access disabled by an admin.' },
    })
    expect(unbanAuthUser).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { userId: 'user-3' },
    })
  })
})

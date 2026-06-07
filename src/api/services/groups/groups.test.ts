import { beforeEach, describe, expect, mock, test } from 'bun:test'

const prisma = {
  group: {
    findMany: mock(async (): Promise<unknown> => []),
    findUnique: mock(async (): Promise<unknown> => null),
    update: mock(async (): Promise<unknown> => null),
  },
  user: {
    findUnique: mock(async (): Promise<unknown> => null),
  },
  userGroupMembership: {
    create: mock(async (): Promise<unknown> => null),
    deleteMany: mock(async () => ({ count: 0 })),
    findMany: mock(async (): Promise<unknown> => []),
  },
}

mock.module('@/db', () => ({ prisma }))

const { getGroupById, getGroups } = await import('./groupsService')
const { createGroupMembership, deleteGroupMembership, getGroupMembers } = await import('./membershipService')

const createdAt = new Date('2026-01-01T00:00:00.000Z')
const updatedAt = new Date('2026-01-02T00:00:00.000Z')
const addedAt = new Date('2026-01-03T00:00:00.000Z')

beforeEach(() => {
  prisma.group.findMany.mockReset()
  prisma.group.findUnique.mockReset()
  prisma.group.update.mockReset()
  prisma.user.findUnique.mockReset()
  prisma.userGroupMembership.create.mockReset()
  prisma.userGroupMembership.deleteMany.mockReset()
  prisma.userGroupMembership.findMany.mockReset()
})

describe('group services', () => {
  test('lists groups with direct and effective member counts', async () => {
    prisma.group.findMany.mockResolvedValueOnce([
      groupRecord({ id: 'root', name: 'Choir', parentGroupId: null }),
      groupRecord({ id: 'soprano', name: 'Soprano', parentGroupId: 'root' }),
    ])
    prisma.userGroupMembership.findMany.mockResolvedValueOnce([
      { groupId: 'root', userId: 'root-member' },
      { groupId: 'soprano', userId: 'section-member' },
    ])

    const groups = await getGroups()

    expect(groups).toMatchObject([
      { id: 'root', name: 'Choir', directMemberCount: 1, effectiveMemberCount: 2 },
      { id: 'soprano', name: 'Soprano', directMemberCount: 1, effectiveMemberCount: 1 },
    ])
  })

  test('fetches group details with direct and effective member counts', async () => {
    prisma.group.findUnique.mockResolvedValueOnce(groupRecord({ id: 'root', name: 'Choir', parentGroupId: null }))
    prisma.group.findMany.mockResolvedValueOnce([
      { id: 'root', parentGroupId: null },
      { id: 'alto', parentGroupId: 'root' },
    ])
    prisma.userGroupMembership.findMany.mockResolvedValueOnce([{ groupId: 'alto', userId: 'alto-member' }])

    const group = await getGroupById('root')

    expect(group).toMatchObject({
      id: 'root',
      name: 'Choir',
      directMemberCount: 0,
      effectiveMemberCount: 1,
    })
  })

  test('throws a 404 when group details are requested for a missing group', async () => {
    prisma.group.findUnique.mockResolvedValueOnce(null)
    prisma.group.findMany.mockResolvedValueOnce([])
    prisma.userGroupMembership.findMany.mockResolvedValueOnce([])

    await expect(getGroupById('missing')).rejects.toMatchObject({
      message: 'Group not found',
      status: 404,
    })
  })
})

describe('membership services', () => {
  test('returns only direct members when requested', async () => {
    prisma.group.findUnique.mockResolvedValueOnce({ id: 'soprano' })
    prisma.userGroupMembership.findMany.mockResolvedValueOnce([
      { userId: 'user-1', addedAt, user: { name: 'Ada' } },
    ])

    const members = await getGroupMembers('soprano', true)

    expect(members).toEqual([{ userId: 'user-1', name: 'Ada', isDirect: true, addedAt }])
    expect(prisma.group.findMany).not.toHaveBeenCalled()
  })

  test('returns effective members from descendant groups', async () => {
    prisma.group.findUnique.mockResolvedValueOnce({ id: 'root' })
    prisma.userGroupMembership.findMany
      .mockResolvedValueOnce([{ userId: 'direct-user', addedAt, user: { name: 'Direct' } }])
      .mockResolvedValueOnce([
        { userId: 'descendant-user', addedAt, user: { name: 'Descendant' } },
        { userId: 'direct-user', addedAt, user: { name: 'Duplicate direct' } },
      ])
    prisma.group.findMany.mockResolvedValueOnce([
      { id: 'root', parentGroupId: null },
      { id: 'child', parentGroupId: 'root' },
    ])

    const members = await getGroupMembers('root')

    expect(members).toEqual([
      { userId: 'direct-user', name: 'Direct', isDirect: true, addedAt },
      { userId: 'descendant-user', name: 'Descendant', isDirect: false, addedAt: null },
    ])
  })

  test('creates a direct membership response with member details', async () => {
    prisma.group.findUnique.mockResolvedValueOnce({ id: 'soprano', isContainer: false })
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', name: 'Ada' })
    prisma.userGroupMembership.create.mockResolvedValueOnce({ userId: 'user-1', addedAt, user: { name: 'Ada' } })

    const membership = await createGroupMembership('soprano', 'user-1')

    expect(membership).toEqual({ userId: 'user-1', name: 'Ada', isDirect: true, addedAt })
  })

  test('rejects direct memberships for container groups', async () => {
    prisma.group.findUnique.mockResolvedValueOnce({ id: 'choir', isContainer: true })
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', name: 'Ada' })

    await expect(createGroupMembership('choir', 'user-1')).rejects.toMatchObject({
      message: 'Direct memberships cannot be added to container groups',
      status: 409,
    })
    expect(prisma.userGroupMembership.create).not.toHaveBeenCalled()
  })

  test('translates duplicate direct memberships to a conflict', async () => {
    prisma.group.findUnique.mockResolvedValueOnce({ id: 'soprano', isContainer: false })
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', name: 'Ada' })
    prisma.userGroupMembership.create.mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: 'P2002' }))

    await expect(createGroupMembership('soprano', 'user-1')).rejects.toMatchObject({
      message: 'User is already a direct member of this group',
      status: 409,
    })
  })

  test('deletes memberships in one database call', async () => {
    prisma.userGroupMembership.deleteMany.mockResolvedValueOnce({ count: 1 })

    await expect(deleteGroupMembership('soprano', 'user-1')).resolves.toBeUndefined()
    expect(prisma.userGroupMembership.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', groupId: 'soprano' },
    })
  })

  test('throws a 404 when deleting a missing direct membership', async () => {
    prisma.userGroupMembership.deleteMany.mockResolvedValueOnce({ count: 0 })

    await expect(deleteGroupMembership('soprano', 'missing')).rejects.toMatchObject({
      message: 'Membership not found',
      status: 404,
    })
  })
})

function groupRecord({
  id,
  name,
  parentGroupId,
}: {
  id: string
  name: string
  parentGroupId: string | null
}) {
  return {
    id,
    kindId: 'kind-1',
    kind: { id: 'kind-1', name: 'Section', description: null, createdAt, updatedAt },
    name,
    description: null,
    isContainer: false,
    parentGroupId,
    createdAt,
    updatedAt,
  }
}

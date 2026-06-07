import { beforeEach, describe, expect, mock, test } from 'bun:test'

const prisma = {
  position: {
    create: mock(async (): Promise<unknown> => null),
    delete: mock(async (): Promise<unknown> => null),
    findFirst: mock(async (): Promise<unknown> => null),
    findMany: mock(async (): Promise<unknown> => []),
    findUnique: mock(async (): Promise<unknown> => null),
    update: mock(async (): Promise<unknown> => null),
  },
  positionGroup: {
    create: mock(async (): Promise<unknown> => null),
    delete: mock(async (): Promise<unknown> => null),
  },
}

const assertGroupExists = mock(async (): Promise<void> => {})
const assertGroupsExist = mock(async (): Promise<void> => {})
const assertUserExists = mock(async (): Promise<void> => {})

mock.module('@/db', () => ({ prisma }))
mock.module('@/api/services/groups/assertions', () => ({
  assertGroupExists,
  assertGroupsExist,
  assertUserExists,
  uniqueIds: (ids: readonly string[] = []) => [...new Set(ids.filter(Boolean))],
}))

const { createPosition, updatePosition } = await import('./positionService')

const createdAt = new Date('2026-01-01T00:00:00.000Z')
const updatedAt = new Date('2026-01-02T00:00:00.000Z')

beforeEach(() => {
  prisma.position.create.mockReset()
  prisma.position.delete.mockReset()
  prisma.position.findFirst.mockReset()
  prisma.position.findMany.mockReset()
  prisma.position.findUnique.mockReset()
  prisma.position.update.mockReset()
  prisma.positionGroup.create.mockReset()
  prisma.positionGroup.delete.mockReset()
  assertGroupExists.mockReset()
  assertGroupsExist.mockReset()
  assertUserExists.mockReset()
})

describe('position services', () => {
  test('updates name, groups, holder, and heldSince in one write', async () => {
    const heldSince = new Date('2026-02-01T00:00:00.000Z')

    prisma.position.findUnique.mockResolvedValueOnce(positionRecord({ currentHolder: null }))
    prisma.position.findFirst.mockResolvedValueOnce(null)
    prisma.position.update.mockResolvedValueOnce(
      positionRecord({
        name: 'Section Lead',
        currentHolder: { id: 'user-1', name: 'Ada' },
        heldSince,
        groups: [{ groupId: 'group-2' }],
      }),
    )

    const position = await updatePosition('position-1', {
      name: 'Section Lead',
      groupIds: ['group-2', 'group-2'],
      currentHolderUserId: 'user-1',
      heldSince,
    })

    expect(position).toMatchObject({
      id: 'position-1',
      name: 'Section Lead',
      groupIds: ['group-2'],
      currentHolder: { id: 'user-1', name: 'Ada' },
      heldSince,
    })
    expect(assertGroupsExist).toHaveBeenCalledWith(['group-2'])
    expect(assertUserExists).toHaveBeenCalledWith('user-1')
    expect(prisma.position.update).toHaveBeenCalledWith({
      where: { id: 'position-1' },
      data: {
        name: 'Section Lead',
        description: undefined,
        currentHolderUserId: 'user-1',
        heldSince,
        groups: {
          deleteMany: {},
          create: [{ groupId: 'group-2' }],
        },
      },
      include: {
        currentHolder: {
          select: { id: true, name: true },
        },
        groups: {
          select: { groupId: true },
        },
      },
    })
  })

  test('rejects heldSince when an update vacates a position', async () => {
    prisma.position.findUnique.mockResolvedValueOnce(
      positionRecord({ currentHolder: { id: 'user-1', name: 'Ada' } }),
    )

    await expect(
      updatePosition('position-1', {
        currentHolderUserId: null,
        heldSince: new Date('2026-02-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      message: 'A vacant position cannot have heldSince set',
    })
    expect(prisma.position.update).not.toHaveBeenCalled()
  })

  test('rejects create without any groups before validating group existence', async () => {
    prisma.position.findFirst.mockResolvedValueOnce(null)

    await expect(
      createPosition({
        name: 'Section Lead',
        groupIds: [],
      }),
    ).rejects.toMatchObject({
      message: 'At least one group is required',
    })
    expect(assertGroupsExist).not.toHaveBeenCalled()
  })
})

function positionRecord({
  name = 'Old Position',
  description = null,
  currentHolder = null,
  heldSince = null,
  groups = [{ groupId: 'group-1' }],
}: {
  name?: string
  description?: string | null
  currentHolder?: { id: string; name: string } | null
  heldSince?: Date | null
  groups?: Array<{ groupId: string }>
} = {}) {
  return {
    id: 'position-1',
    name,
    description,
    currentHolder,
    heldSince,
    groups,
    createdAt,
    updatedAt,
  }
}

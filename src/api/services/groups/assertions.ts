import { prisma } from '@/db'

import { GroupServiceError } from './errors'

export async function assertGroupKindExists(id: string) {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!groupKind) {
    throw new GroupServiceError('Group kind not found', 404)
  }
}

export async function assertGroupExists(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }
}

export async function assertGroupsExist(groupIds: string[]) {
  if (!groupIds.length) {
    throw new GroupServiceError('At least one group is required')
  }

  const groups = await prisma.group.findMany({
    where: {
      id: {
        in: groupIds,
      },
    },
    select: { id: true },
  })

  if (groups.length !== groupIds.length) {
    throw new GroupServiceError('One or more groups were not found', 404)
  }
}

export async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  await assertGroupExists(parentGroupId)
}

export async function assertPersonExists(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  })

  if (!person) {
    throw new GroupServiceError('Person not found', 404)
  }
}

export async function assertUniqueGroupKindName(name: string) {
  const existingGroupKind = await prisma.groupKind.findUnique({
    where: { name },
    select: { id: true },
  })

  if (existingGroupKind) {
    throw new GroupServiceError('Group kind name already exists', 409)
  }
}

export async function assertUniqueGroupName(name: string, parentGroupId: string | null, ignoreGroupId?: string) {
  const existingGroup = await prisma.group.findFirst({
    where: {
      name,
      parentGroupId,
      id: ignoreGroupId ? { not: ignoreGroupId } : undefined,
    },
    select: { id: true },
  })

  if (existingGroup) {
    throw new GroupServiceError('Group name already exists under this parent', 409)
  }
}

export async function assertGroupParentDoesNotCreateCycle(groupId: string, parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  if (groupId === parentGroupId) {
    throw new GroupServiceError('A group cannot be its own parent', 409)
  }

  let currentParentId: string | null = parentGroupId

  while (currentParentId) {
    if (currentParentId === groupId) {
      throw new GroupServiceError('Group hierarchy cannot contain cycles', 409)
    }

    const parent: { parentGroupId: string | null } | null = await prisma.group.findUnique({
      where: { id: currentParentId },
      select: { parentGroupId: true },
    })

    currentParentId = parent?.parentGroupId ?? null
  }
}

export async function getDescendantGroupIds(groupId: string) {
  const descendants: string[] = []
  const queue = [groupId]

  while (queue.length > 0) {
    const currentGroupId = queue.shift()

    if (!currentGroupId) {
      continue
    }

    const children = await prisma.group.findMany({
      where: {
        parentGroupId: currentGroupId,
      },
      select: {
        id: true,
      },
    })

    for (const child of children) {
      descendants.push(child.id)
      queue.push(child.id)
    }
  }

  return descendants
}

export function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter(Boolean))]
}

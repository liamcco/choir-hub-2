import { prisma } from '@/db'

import { ApiError } from '@/api/errors'

/**
 * Asserts that a group kind exists
 * @param id
 */
export async function assertGroupKindExists(id: string) {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!groupKind) {
    throw new ApiError('Group kind not found', 404)
  }
}

/**
 * Asserts that a group exists
 * @param id
 */
export async function assertGroupExists(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!group) {
    throw new ApiError('Group not found', 404)
  }
}

/**
 * Asserts that multiple groups exist
 * @param groupIds
 */
export async function assertGroupsExist(groupIds: string[]): Promise<void> {
  if (!groupIds.length) {
    return
  }

  const uniqueGroupIds = uniqueIds(groupIds)
  const groups = await prisma.group.findMany({
    where: {
      id: {
        in: uniqueGroupIds,
      },
    },
    select: { id: true },
  })

  if (groups.length !== uniqueGroupIds.length) {
    throw new ApiError('One or more groups were not found', 404)
  }
}

/**
 * Asserts that a parent group exists
 * @param parentGroupId
 */
export async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  await assertGroupExists(parentGroupId)
}

/**
 *
 * @param userId
 */
export async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new ApiError('User not found', 404)
  }
}

/**
 *
 * @param name
 */
export async function assertUniqueGroupKindName(name: string) {
  const existingGroupKind = await prisma.groupKind.findUnique({
    where: { name },
    select: { id: true },
  })

  if (existingGroupKind) {
    throw new ApiError('Group kind name already exists', 409)
  }
}

/**
 * Asserts that a group name is unique
 * @param name
 * @param parentGroupId
 * @param ignoreGroupId
 */
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
    throw new ApiError('Group name already exists under this parent', 409)
  }
}

export async function assertGroupParentDoesNotCreateCycle(groupId: string, parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  if (groupId === parentGroupId) {
    throw new ApiError('A group cannot be its own parent', 409)
  }

  let currentParentId: string | null = parentGroupId

  while (currentParentId) {
    if (currentParentId === groupId) {
      throw new ApiError('Group hierarchy cannot contain cycles', 409)
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

export function uniqueIds(ids: readonly string[] = []) {
  return [...new Set(ids.filter(Boolean))]
}

import { z } from 'zod'

import { prisma } from '@/db'

import {
  assignPositionHolderRequestSchema,
  createPositionRequestSchema,
  updatePositionRequestSchema,
} from '@/api/models/group'
import { assertGroupExists, assertGroupsExist, assertUserExists, uniqueIds } from '@/api/services/groups/assertions'
import { GroupServiceError } from '@/api/services/groups/errors'

type CreatePositionInput = z.infer<typeof createPositionRequestSchema>
type UpdatePositionInput = z.infer<typeof updatePositionRequestSchema>
type AssignPositionHolderInput = z.infer<typeof assignPositionHolderRequestSchema>

const positionInclude = {
  groups: {
    include: {
      group: {
        include: {
          kind: true,
        },
      },
    },
    orderBy: {
      group: {
        name: 'asc',
      },
    },
  },
} as const

export async function getPositions() {
  return await prisma.position.findMany({
    include: positionInclude,
  })
}

export async function getPositionsInGroup(groupId: string) {
  await assertGroupExists(groupId)

  return await prisma.position.findMany({
    where: {
      groups: {
        some: {
          groupId,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getPositionById(id: string) {
  return await prisma.position.findUnique({
    where: { id },
    include: positionInclude,
  })
}

export async function createGroupPosition(groupId: string, input: CreatePositionInput) {
  const groupIds = uniqueIds([groupId, ...(input.groupIds ?? [])])

  await assertGroupsExist(groupIds)
  await assertUniquePositionName(input.name)

  if (input.currentHolderUserId) {
    await assertUserExists(input.currentHolderUserId)
  }

  if (!input.currentHolderUserId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  return await prisma.position.create({
    data: {
      name: input.name,
      description: input.description,
      currentHolderUserId: input.currentHolderUserId,
      heldSince: input.currentHolderUserId ? (input.heldSince ?? new Date()) : null,
      groups: {
        create: groupIds.map((associatedGroupId) => ({
          groupId: associatedGroupId,
        })),
      },
    },
    include: positionInclude,
  })
}

export async function deletePositionFromGroup(positionId: string, groupId: string) {
  await assertGroupExists(groupId)

  const position = await getPositionById(positionId)

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  const isAssociatedWithGroup = position.groups.some((association) => association.groupId === groupId)

  if (!isAssociatedWithGroup) {
    throw new GroupServiceError('Position is not associated with the specified group', 404)
  }

  await prisma.positionGroup.deleteMany({
    where: {
      positionId,
      groupId,
    },
  })
}

export async function updatePosition(id: string, input: UpdatePositionInput) {
  const position = await getExistingPosition(id)
  const nextName = input.name ?? position.name

  if (nextName !== position.name) {
    await assertUniquePositionName(nextName, id)
  }

  const groupIds = input.groupIds ? uniqueIds(input.groupIds) : undefined

  if (groupIds) {
    if (!groupIds.length) {
      throw new GroupServiceError('At least one group is required')
    }

    await assertGroupsExist(groupIds)
  }

  const isHolderUpdate = Object.hasOwn(input, 'currentHolderUserId')
  const currentHolderUserId = isHolderUpdate ? (input.currentHolderUserId ?? null) : position.currentHolderUserId

  if (currentHolderUserId) {
    await assertUserExists(currentHolderUserId)
  }

  if (!currentHolderUserId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  if (!currentHolderUserId && Object.hasOwn(input, 'heldSince') && input.heldSince === null) {
    return await prisma.position.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        currentHolderUserId: null,
        heldSince: null,
        groups: groupIds
          ? {
              deleteMany: {},
              create: groupIds.map((associatedGroupId) => ({ groupId: associatedGroupId })),
            }
          : undefined,
      },
      include: positionInclude,
    })
  }

  return await prisma.position.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      currentHolderUserId: isHolderUpdate ? currentHolderUserId : undefined,
      heldSince: currentHolderUserId
        ? Object.hasOwn(input, 'heldSince')
          ? (input.heldSince ?? new Date())
          : isHolderUpdate
            ? new Date()
            : undefined
        : isHolderUpdate
          ? null
          : undefined,
      groups: groupIds
        ? {
            deleteMany: {},
            create: groupIds.map((associatedGroupId) => ({ groupId: associatedGroupId })),
          }
        : undefined,
    },
    include: positionInclude,
  })
}

export async function assignPositionHolder(id: string, input: AssignPositionHolderInput) {
  await getExistingPosition(id)
  await assertUserExists(input.currentHolderUserId)

  return await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: input.currentHolderUserId,
      heldSince: input.heldSince ?? new Date(),
    },
    include: positionInclude,
  })
}

export async function vacatePosition(id: string) {
  await getExistingPosition(id)

  return await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: null,
      heldSince: null,
    },
    include: positionInclude,
  })
}

export async function deletePosition(id: string) {
  await getExistingPosition(id)

  await prisma.position.delete({
    where: { id },
  })
}

async function assertUniquePositionName(name: string, ignorePositionId?: string) {
  const existingPosition = await prisma.position.findFirst({
    where: {
      name,
      id: ignorePositionId ? { not: ignorePositionId } : undefined,
    },
    select: { id: true },
  })

  if (existingPosition) {
    throw new GroupServiceError('Position name already exists', 409)
  }
}

async function getExistingPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: positionInclude,
  })

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  return position
}

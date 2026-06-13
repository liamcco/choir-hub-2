import { z } from 'zod'

import { prisma } from '@/db'

import { assignPositionHolderRequestSchema, updatePositionRequestSchema } from '@/api/models/group'
import { createPositionRequestSchema, positionSchema } from '@/api/models/position'
import { assertGroupExists, assertGroupsExist, assertUserExists, uniqueIds } from '@/api/services/groups/assertions'
import { GroupServiceError } from '@/api/services/groups/errors'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

type CreatePositionInput = z.infer<typeof createPositionRequestSchema>
type UpdatePositionInput = z.infer<typeof updatePositionRequestSchema>
type AssignPositionHolderInput = z.infer<typeof assignPositionHolderRequestSchema>

export async function getPositions(): Promise<z.infer<typeof positionSchema>[]> {
  return await prisma.position.findMany({
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function getPositionById(id: string): Promise<z.infer<typeof positionSchema>> {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  return position
}

export async function createPosition(input: CreatePositionInput): Promise<z.infer<typeof positionSchema>> {
  await assertUniquePositionName(input.name)

  const groupIds = uniqueIds(input.groupIds || [])

  if (groupIds.length) {
    await assertGroupsExist(groupIds)
  }

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
      currentHolderUserId: input.currentHolderUserId ?? null,
      heldSince: input.currentHolderUserId ? (input.heldSince ?? new Date()) : null,
      groups: groupIds.length
        ? {
            create: groupIds.map((groupId) => ({ groupId })),
          }
        : undefined,
    },
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function getPositionsInGroup(groupId: string): Promise<z.infer<typeof positionSchema>[]> {
  await assertGroupExists(groupId)

  return await prisma.position.findMany({
    where: {
      groups: {
        some: {
          groupId,
        },
      },
    },
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function addPositionToGroup(positionId: string, groupId: string): Promise<void> {
  await assertGroupExists(groupId)

  const position = await getPositionById(positionId)

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  try {
    await prisma.positionGroup.create({
      data: {
        positionId,
        groupId,
      },
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return
    }

    throw error
  }
}

export async function deletePositionFromGroup(positionId: string, groupId: string): Promise<void> {
  const position = await getPositionById(positionId)

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  await prisma.positionGroup.deleteMany({
    where: {
      positionId,
      groupId,
    },
  })
}

export async function updatePosition(id: string, input: UpdatePositionInput): Promise<z.infer<typeof positionSchema>> {
  const position = await getPositionById(id)
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
  const currentHolderUserId = isHolderUpdate ? (input.currentHolderUserId ?? null) : position.currentHolder?.id

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
      include: {
        currentHolder: {
          select: { id: true, name: true },
        },
      },
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
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function assignPositionHolder(
  id: string,
  input: AssignPositionHolderInput,
): Promise<z.infer<typeof positionSchema>> {
  await getPositionById(id)
  await assertUserExists(input.currentHolderUserId)

  return await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: input.currentHolderUserId,
      heldSince: input.heldSince ?? new Date(),
    },
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function vacatePosition(id: string): Promise<z.infer<typeof positionSchema>> {
  await getPositionById(id)

  return await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: null,
      heldSince: null,
    },
    include: {
      currentHolder: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function deletePosition(id: string): Promise<void> {
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

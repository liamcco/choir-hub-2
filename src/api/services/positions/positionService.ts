import { z } from 'zod'

import { prisma } from '@/db'

import {
  assignPositionHolderRequestSchema,
  createPositionRequestSchema,
  updatePositionRequestSchema,
} from '@/api/models/group'
import { assertGroupExists, assertGroupsExist, assertPersonExists, uniqueIds } from '@/api/services/groups/assertions'
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

export async function getGroupPositions(groupId: string) {
  await assertGroupExists(groupId)

  return await prisma.position.findMany({
    where: {
      groups: {
        some: {
          groupId,
        },
      },
    },
    include: positionInclude,
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

  if (input.currentHolderPersonId) {
    await assertPersonExists(input.currentHolderPersonId)
  }

  if (!input.currentHolderPersonId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  return await prisma.position.create({
    data: {
      name: input.name,
      description: input.description,
      currentHolderPersonId: input.currentHolderPersonId,
      heldSince: input.currentHolderPersonId ? (input.heldSince ?? new Date()) : null,
      groups: {
        create: groupIds.map((associatedGroupId) => ({
          groupId: associatedGroupId,
        })),
      },
    },
    include: positionInclude,
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

  const isHolderUpdate = Object.hasOwn(input, 'currentHolderPersonId')
  const currentHolderPersonId = isHolderUpdate ? (input.currentHolderPersonId ?? null) : position.currentHolderPersonId

  if (currentHolderPersonId) {
    await assertPersonExists(currentHolderPersonId)
  }

  if (!currentHolderPersonId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  if (!currentHolderPersonId && Object.hasOwn(input, 'heldSince') && input.heldSince === null) {
    return await prisma.position.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        currentHolderPersonId: null,
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
      currentHolderPersonId: isHolderUpdate ? currentHolderPersonId : undefined,
      heldSince: currentHolderPersonId
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
  await assertPersonExists(input.currentHolderPersonId)

  return await prisma.position.update({
    where: { id },
    data: {
      currentHolderPersonId: input.currentHolderPersonId,
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
      currentHolderPersonId: null,
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

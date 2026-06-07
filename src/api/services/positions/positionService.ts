import { z } from 'zod'

import { prisma } from '@/db'

import {
  assignPositionHolderRequestSchema,
  createPositionRequestSchema,
  positionSchema,
  updatePositionRequestSchema,
} from '@/api/models/position'
import { ApiError } from '@/api/errors'
import { assertGroupExists, assertGroupsExist, assertUserExists, uniqueIds } from '@/api/services/groups/assertions'

type CreatePositionInput = z.infer<typeof createPositionRequestSchema>
type UpdatePositionInput = z.infer<typeof updatePositionRequestSchema>
type AssignPositionHolderInput = z.infer<typeof assignPositionHolderRequestSchema>
type Position = z.infer<typeof positionSchema>
type PositionUpdateState = {
  currentHolderUserId: string | null
  groupIds: string[] | undefined
  heldSince: Date | null | undefined
  isHolderUpdate: boolean
}

const positionInclude = {
  currentHolder: {
    select: { id: true, name: true },
  },
  groups: {
    select: { groupId: true },
  },
} as const

export async function getPositions(): Promise<Position[]> {
  const positions = await prisma.position.findMany({
    orderBy: { name: 'asc' },
    include: positionInclude,
  })

  return positions.map(toPosition)
}

export async function getPositionById(id: string): Promise<Position> {
  const position = await prisma.position.findUnique({
    where: { id },
    include: positionInclude,
  })

  if (!position) {
    throw new ApiError('Position not found', 404)
  }

  return toPosition(position)
}

export async function createPosition(input: CreatePositionInput): Promise<Position> {
  await assertUniquePositionName(input.name)

  const groupIds = uniqueIds(input.groupIds)

  if (!groupIds.length) {
    throw new ApiError('At least one group is required')
  }

  await assertGroupsExist(groupIds)

  if (input.currentHolderUserId) {
    await assertUserExists(input.currentHolderUserId)
  }

  if (!input.currentHolderUserId && input.heldSince) {
    throw new ApiError('A vacant position cannot have heldSince set')
  }

  const position = await prisma.position.create({
    data: {
      name: input.name,
      description: input.description,
      currentHolderUserId: input.currentHolderUserId ?? null,
      heldSince: input.currentHolderUserId ? (input.heldSince ?? new Date()) : null,
      groups: {
        create: groupIds.map((groupId) => ({ groupId })),
      },
    },
    include: positionInclude,
  })

  return toPosition(position)
}

export async function getPositionsInGroup(groupId: string): Promise<Position[]> {
  await assertGroupExists(groupId)

  const positions = await prisma.position.findMany({
    where: {
      groups: {
        some: {
          groupId,
        },
      },
    },
    orderBy: { name: 'asc' },
    include: positionInclude,
  })

  return positions.map(toPosition)
}

export async function addPositionToGroup(groupId: string, positionId: string): Promise<Position> {
  await Promise.all([assertGroupExists(groupId), getPositionById(positionId)])

  try {
    await prisma.positionGroup.create({
      data: {
        positionId,
        groupId,
      },
    })
  } catch (error) {
    if (!isPrismaRequestError(error, 'P2002')) {
      throw error
    }
  }

  return getPositionById(positionId)
}

export async function deletePositionFromGroup(groupId: string, positionId: string): Promise<void> {
  await assertGroupExists(groupId)

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: {
      id: true,
      groups: {
        select: { groupId: true },
      },
    },
  })
  if (!position) {
    throw new ApiError('Position not found', 404)
  }

  const isAssociatedWithGroup = position.groups.some((group) => group.groupId === groupId)

  if (!isAssociatedWithGroup) {
    throw new ApiError('Position is not associated with this group', 404)
  }

  if (position.groups.length === 1) {
    throw new ApiError('A position must be associated with at least one group', 409)
  }

  await prisma.positionGroup.delete({
    where: {
      positionId_groupId: {
        positionId,
        groupId,
      },
    },
  })
}

export async function updatePosition(id: string, input: UpdatePositionInput): Promise<Position> {
  const position = await getPositionById(id)
  const state = await preparePositionUpdate(position, input, id)

  const updatedPosition = await prisma.position.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      currentHolderUserId: state.isHolderUpdate ? state.currentHolderUserId : undefined,
      heldSince: state.heldSince,
      groups: state.groupIds
        ? {
            deleteMany: {},
            create: state.groupIds.map((associatedGroupId) => ({ groupId: associatedGroupId })),
          }
        : undefined,
    },
    include: positionInclude,
  })

  return toPosition(updatedPosition)
}

async function preparePositionUpdate(
  position: Position,
  input: UpdatePositionInput,
  positionId: string,
): Promise<PositionUpdateState> {
  await assertNextPositionName(input.name ?? position.name, position.name, positionId)

  const groupIds = await getUpdateGroupIds(input.groupIds)
  const holder = await getUpdateHolderState(position, input)

  return {
    ...holder,
    groupIds,
    heldSince: getNextHeldSince({
      ...holder,
      previousHolderUserId: position.currentHolder?.id ?? null,
      isHeldSinceUpdate: Object.hasOwn(input, 'heldSince'),
      inputHeldSince: input.heldSince,
    }),
  }
}

async function assertNextPositionName(nextName: string, currentName: string, positionId: string) {
  if (nextName !== currentName) {
    await assertUniquePositionName(nextName, positionId)
  }
}

async function getUpdateGroupIds(inputGroupIds: string[] | undefined) {
  if (!inputGroupIds) {
    return undefined
  }

  const groupIds = uniqueIds(inputGroupIds)

  if (!groupIds.length) {
    throw new ApiError('At least one group is required')
  }

  await assertGroupsExist(groupIds)
  return groupIds
}

async function getUpdateHolderState(position: Position, input: UpdatePositionInput) {
  const isHolderUpdate = Object.hasOwn(input, 'currentHolderUserId')
  const currentHolderUserId = isHolderUpdate ? (input.currentHolderUserId ?? null) : (position.currentHolder?.id ?? null)

  if (currentHolderUserId) {
    await assertUserExists(currentHolderUserId)
  }

  if (!currentHolderUserId && input.heldSince) {
    throw new ApiError('A vacant position cannot have heldSince set')
  }

  return { currentHolderUserId, isHolderUpdate }
}

export async function assignPositionHolder(
  id: string,
  input: AssignPositionHolderInput,
): Promise<Position> {
  await getPositionById(id)
  await assertUserExists(input.currentHolderUserId)

  const position = await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: input.currentHolderUserId,
      heldSince: input.heldSince ?? new Date(),
    },
    include: positionInclude,
  })

  return toPosition(position)
}

export async function vacatePosition(id: string): Promise<Position> {
  await getPositionById(id)

  const position = await prisma.position.update({
    where: { id },
    data: {
      currentHolderUserId: null,
      heldSince: null,
    },
    include: positionInclude,
  })

  return toPosition(position)
}

export async function deletePosition(id: string): Promise<void> {
  await getPositionById(id)

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
    throw new ApiError('Position name already exists', 409)
  }
}

function toPosition(position: unknown): Position {
  const groupIds = getPositionGroupIds(position)

  if (typeof position !== 'object' || position === null) {
    return positionSchema.parse(position)
  }

  return positionSchema.parse({
    ...position,
    groupIds,
  })
}

function getPositionGroupIds(position: unknown): string[] {
  if (typeof position !== 'object' || position === null || !('groups' in position)) {
    return []
  }

  const groups = position.groups

  if (!Array.isArray(groups)) {
    return []
  }

  return groups.flatMap((group) => {
    if (typeof group === 'object' && group !== null && 'groupId' in group && typeof group.groupId === 'string') {
      return [group.groupId]
    }

    return []
  })
}

function getNextHeldSince({
  currentHolderUserId,
  previousHolderUserId,
  isHolderUpdate,
  isHeldSinceUpdate,
  inputHeldSince,
}: {
  currentHolderUserId: string | null
  previousHolderUserId: string | null
  isHolderUpdate: boolean
  isHeldSinceUpdate: boolean
  inputHeldSince: Date | null | undefined
}): Date | null | undefined {
  if (!currentHolderUserId) {
    return isHolderUpdate || isHeldSinceUpdate ? null : undefined
  }

  if (isHeldSinceUpdate) {
    return inputHeldSince ?? new Date()
  }

  if (isHolderUpdate && currentHolderUserId !== previousHolderUserId) {
    return new Date()
  }

  return undefined
}

function isPrismaRequestError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code === code
  )
}

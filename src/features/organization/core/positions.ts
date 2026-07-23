import 'server-only'

import { prisma } from '@/core/db'
import { EntityDoesNotExistError, InvalidRelationshipError } from '@/features/organization/core/errors'
import { normalizeOptionalString } from '@/shared/formatting'

export const positions = {
  list() {
    return prisma.position.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] })
  },

  listScopes() {
    return prisma.positionScope.findMany({ orderBy: [{ positionId: 'asc' }, { groupId: 'asc' }] })
  },

  findPosition({ positionId }: { positionId: string }) {
    return prisma.position.findUnique({ where: { id: positionId } })
  },

  async create(input: { name: string; description?: string | null; groupIds: string[] }) {
    const groupIds = await validateGroupIds(input.groupIds)
    return prisma.$transaction(async (transaction) => {
      const position = await transaction.position.create({
        data: { name: input.name.trim(), description: normalizeOptionalString(input.description) },
      })
      await transaction.positionScope.createMany({
        data: groupIds.map((groupId) => ({ positionId: position.id, groupId })),
      })
      return position
    })
  },

  async update(positionId: string, input: { name: string; description?: string | null; groupIds: string[] }) {
    const groupIds = await validateGroupIds(input.groupIds)
    await assertPositionExists(positionId)
    return prisma.$transaction(async (transaction) => {
      const position = await transaction.position.update({
        where: { id: positionId },
        data: { name: input.name.trim(), description: normalizeOptionalString(input.description) },
      })
      await transaction.positionScope.deleteMany({ where: { positionId } })
      await transaction.positionScope.createMany({
        data: groupIds.map((groupId) => ({ positionId, groupId })),
      })
      return position
    })
  },
}

async function assertPositionExists(positionId: string) {
  const position = await prisma.position.findUnique({ where: { id: positionId }, select: { id: true } })
  if (!position) {
    throw new EntityDoesNotExistError('Choose an existing Position.')
  }
}

async function validateGroupIds(rawGroupIds: string[]) {
  const groupIds = [...new Set(rawGroupIds.map((groupId) => groupId.trim()).filter(Boolean))]
  if (groupIds.length === 0) {
    throw new InvalidRelationshipError('Choose at least one Group.', {
      field: 'groupIds',
    })
  }
  const knownGroupIds = new Set((await prisma.group.findMany({ select: { id: true } })).map((group) => group.id))
  const unknownGroupId = groupIds.find((groupId) => !knownGroupIds.has(groupId))
  if (unknownGroupId) {
    throw new EntityDoesNotExistError('Choose an existing Group.', {
      field: 'groupIds',
    })
  }
  return groupIds
}

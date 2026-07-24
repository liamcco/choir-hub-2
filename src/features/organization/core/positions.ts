import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { group, positionScope, position as positionTable } from '@/drizzle/schema'
import { EntityDoesNotExistError, InvalidRelationshipError } from '@/features/organization/core/errors'
import { normalizeOptionalString } from '@/shared/formatting'

export const positions = {
  list() {
    return db.select().from(positionTable).orderBy(asc(positionTable.name), asc(positionTable.id))
  },

  listScopes() {
    return db.select().from(positionScope).orderBy(asc(positionScope.positionId), asc(positionScope.groupId))
  },

  findPosition({ positionId }: { positionId: string }) {
    return db
      .select()
      .from(positionTable)
      .where(eq(positionTable.id, positionId))
      .limit(1)
      .then((rows) => rows[0] ?? null)
  },

  async create(input: { name: string; description?: string | null; groupIds: string[] }) {
    const groupIds = await validateGroupIds(input.groupIds)
    return db.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(positionTable)
        .values({ name: input.name.trim(), description: normalizeOptionalString(input.description) })
        .returning()
      await transaction.insert(positionScope).values(groupIds.map((groupId) => ({ positionId: created.id, groupId })))
      return created
    })
  },

  async update(positionId: string, input: { name: string; description?: string | null; groupIds: string[] }) {
    const groupIds = await validateGroupIds(input.groupIds)
    await assertPositionExists(positionId)
    return db.transaction(async (transaction) => {
      const [updated] = await transaction
        .update(positionTable)
        .set({
          name: input.name.trim(),
          description: normalizeOptionalString(input.description),
          updatedAt: new Date(),
        })
        .where(eq(positionTable.id, positionId))
        .returning()
      await transaction.delete(positionScope).where(eq(positionScope.positionId, positionId))
      await transaction.insert(positionScope).values(groupIds.map((groupId) => ({ positionId, groupId })))
      return updated
    })
  },
}

async function assertPositionExists(positionId: string) {
  const [position] = await db
    .select({ id: positionTable.id })
    .from(positionTable)
    .where(eq(positionTable.id, positionId))
    .limit(1)
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
  const knownGroupIds = new Set((await db.select({ id: group.id }).from(group)).map((row) => row.id))
  const unknownGroupId = groupIds.find((groupId) => !knownGroupIds.has(groupId))
  if (unknownGroupId) {
    throw new EntityDoesNotExistError('Choose an existing Group.', {
      field: 'groupIds',
    })
  }
  return groupIds
}

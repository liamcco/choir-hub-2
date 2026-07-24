import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { choir, positionScope, position as positionTable, section } from '@/drizzle/schema'

export const positions = {
  listChoirs() {
    return db.select().from(choir)
  },
  listSections() {
    return db.select().from(section)
  },
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
}

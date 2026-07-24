import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { group as groupTable } from '@/drizzle/schema'

export const groups = {
  list() {
    return db.select().from(groupTable).orderBy(asc(groupTable.name))
  },
  get(groupId: string) {
    return db
      .select()
      .from(groupTable)
      .where(eq(groupTable.id, groupId))
      .limit(1)
      .then((rows) => rows[0] ?? null)
  },
}

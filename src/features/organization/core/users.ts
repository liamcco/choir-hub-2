import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { type MemberStatus, user } from '@/drizzle/schema'

export const users = {
  list() {
    return db
      .select()
      .from(user)
      .orderBy(asc(user.createdAt), asc(user.id))
      .then((rows) => rows.map(toDomainUser))
  },

  find({ userId }: { userId: string }) {
    return db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((rows) => (rows[0] ? toDomainUser(rows[0]) : null))
  },

  updateMemberStatus(userId: string, status: MemberStatus) {
    return db
      .update(user)
      .set({ status: status.toLowerCase() as never, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning()
      .then((rows) => toDomainUser(rows[0]))
  },
}

function toDomainUser(row: typeof user.$inferSelect) {
  return { ...row, status: row.status.toUpperCase() as MemberStatus }
}

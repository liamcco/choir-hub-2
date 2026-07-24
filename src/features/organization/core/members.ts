import 'server-only'

import { database } from '@/core/db'
import type { MemberStatus } from '@/drizzle/schema'

export const users = {
  list() {
    return database.user.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
  },

  find({ userId }: { userId: string }) {
    return database.user.findUnique({ where: { id: userId } })
  },

  updateMemberStatus(userId: string, status: MemberStatus) {
    return database.user.update({ where: { id: userId }, data: { status } })
  },
}

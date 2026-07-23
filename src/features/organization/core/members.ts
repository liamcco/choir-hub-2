import 'server-only'

import { prisma } from '@/core/db'
import type { MemberStatus } from '@/prisma/generated/client'

export const users = {
  list() {
    return prisma.user.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
  },

  find({ userId }: { userId: string }) {
    return prisma.user.findUnique({ where: { id: userId } })
  },

  updateMemberStatus(userId: string, status: MemberStatus) {
    return prisma.user.update({ where: { id: userId }, data: { status } })
  },
}

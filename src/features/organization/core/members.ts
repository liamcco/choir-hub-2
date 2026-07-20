import 'server-only'

import { prisma } from '@/core/db'
import { EntityDoesNotExistError } from '@/features/organization/core/errors'
import type { MemberStatus } from '@/prisma/generated/client'

export const members = {
  list() {
    return prisma.member.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })
  },

  listIdentities() {
    return prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, email: true },
    })
  },

  create(input: { userId: string; status?: MemberStatus }) {
    return prisma.member.create({
      data: { userId: input.userId, status: input.status ?? 'ACTIVE' },
    })
  },

  async updateStatus(memberId: string, status: MemberStatus) {
    await assertMemberExists(memberId)
    return prisma.member.update({ where: { id: memberId }, data: { status } })
  },
}

async function assertMemberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  if (!member) {
    throw new EntityDoesNotExistError('Choose an existing Member.')
  }
}

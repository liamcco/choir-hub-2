import 'server-only'

import { prisma } from '@/core/db'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/features/organization/core/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/features/organization/core/errors'

export const groupMemberships = {
  list(input?: { memberId?: string; groupId?: string; at?: Date }) {
    return prisma.groupMembership.findMany({
      where: {
        memberId: input?.memberId,
        groupId: input?.groupId,
        ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
      },
      orderBy: [{ groupId: 'asc' }, { memberId: 'asc' }, { startsAt: 'asc' }],
    })
  },

  async create(input: { memberId: string; groupId: string; startsAt: Date; endsAt?: Date | null }) {
    const membership = normalizeDatedPeriodInput(input)
    await assertMemberExists(membership.memberId)
    await assertGroupExists(membership.groupId)
    await assertGroupMembershipDoesNotOverlap(membership)
    return prisma.groupMembership.create({ data: membership })
  },

  async end(membershipId: string, endsAt: Date) {
    const current = await prisma.groupMembership.findUnique({ where: { id: membershipId } })
    if (!current) {
      throw new EntityDoesNotExistError('Choose an existing Group Membership.')
    }
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertGroupMembershipDoesNotOverlap({ ...current, ...period }, membershipId)
    return prisma.groupMembership.update({ where: { id: membershipId }, data: { endsAt } })
  },
}

async function assertMemberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  if (!member) {
    throw new EntityDoesNotExistError('Choose an existing Member.', { field: 'memberId' })
  }
}

async function assertGroupExists(groupId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) {
    throw new EntityDoesNotExistError('Choose an existing Group.', { field: 'groupId' })
  }
}

async function assertGroupMembershipDoesNotOverlap(
  input: { memberId: string; groupId: string; startsAt: Date; endsAt: Date | null },
  excludingMembershipId?: string,
) {
  const memberships = await groupMemberships.list({
    memberId: input.memberId,
    groupId: input.groupId,
  })
  if (findOverlappingDatedPeriod(memberships, input, excludingMembershipId)) {
    throw new DateOverlapError('This Member already has a Group Membership in this Group during that period.', {
      field: 'startsAt',
    })
  }
}

function currentDatedPeriodWhere(at: Date) {
  return { startsAt: { lte: at }, OR: [{ endsAt: null }, { endsAt: { gt: at } }] }
}

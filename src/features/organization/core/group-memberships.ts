import 'server-only'
import { database } from '@/core/db'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/features/organization/core/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/features/organization/core/errors'
export const groupMemberships = {
  list(input?: { userId?: string; groupId?: string; at?: Date }) {
    return database.groupMembership.findMany({
      where: {
        userId: input?.userId,
        groupId: input?.groupId,
        ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
      },
      orderBy: [{ groupId: 'asc' }, { userId: 'asc' }, { startsAt: 'asc' }],
    })
  },
  async create(input: { userId: string; groupId: string; startsAt?: Date; endsAt?: Date | null }) {
    const membership = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertUserExists(membership.userId)
    await assertGroupExists(membership.groupId)
    await assertNoOverlap(membership)
    return database.groupMembership.create({ data: membership })
  },
  async end(membershipId: string, endsAt: Date) {
    const current = await database.groupMembership.findUnique({ where: { id: membershipId } })
    if (!current) throw new EntityDoesNotExistError('Choose an existing Group Membership.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, membershipId)
    return database.groupMembership.update({ where: { id: membershipId }, data: { endsAt } })
  },
}
async function assertUserExists(userId: string) {
  if (!(await database.user.findUnique({ where: { id: userId }, select: { id: true } })))
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}
async function assertGroupExists(groupId: string) {
  if (!(await database.group.findUnique({ where: { id: groupId }, select: { id: true } })))
    throw new EntityDoesNotExistError('Choose an existing Group.', { field: 'groupId' })
}
async function assertNoOverlap(
  input: { userId: string; groupId: string; startsAt: Date; endsAt: Date | null },
  excludingMembershipId?: string,
) {
  if (
    findOverlappingDatedPeriod(
      await groupMemberships.list({ userId: input.userId, groupId: input.groupId }),
      input,
      excludingMembershipId,
    )
  )
    throw new DateOverlapError('This User already has a Group Membership in this Group during that period.', {
      field: 'startsAt',
    })
}
function currentDatedPeriodWhere(at: Date) {
  return { startsAt: { lte: at }, OR: [{ endsAt: null }, { endsAt: { gt: at } }] }
}

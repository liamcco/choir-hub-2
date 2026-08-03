import 'server-only'

import { and, asc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/core/db'
import { type GroupId, resolveGroup } from '@/core/topology'
import { groupMembership as groupMembershipTable, user } from '@/drizzle/schema'
import { assertValidDatedPeriod, findOverlappingDatedPeriod, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'

export const groupMembership = {
  list(input: { userId?: string; groupId?: string } = {}) {
    return db
      .select()
      .from(groupMembershipTable)
      .where(
        and(
          input.userId ? eq(groupMembershipTable.userId, input.userId) : undefined,
          input.groupId ? eq(groupMembershipTable.groupId, input.groupId) : undefined,
          isNull(groupMembershipTable.endsAt),
        ),
      )
      .orderBy(asc(groupMembershipTable.groupId), asc(groupMembershipTable.userId), asc(groupMembershipTable.startsAt))
  },

  listPrevious(input: { userId?: string; groupId?: string } = {}) {
    return db
      .select()
      .from(groupMembershipTable)
      .where(
        and(
          input.userId ? eq(groupMembershipTable.userId, input.userId) : undefined,
          input.groupId ? eq(groupMembershipTable.groupId, input.groupId) : undefined,
          isNotNull(groupMembershipTable.endsAt),
        ),
      )
      .orderBy(asc(groupMembershipTable.groupId), asc(groupMembershipTable.userId), asc(groupMembershipTable.startsAt))
  },

  async start(input: { userId: string; groupId: GroupId; startsAt?: Date; endsAt?: Date | null }) {
    const membership = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertUserExists(membership.userId)
    await assertGroupEligible(membership.groupId)
    await assertNoOverlap(membership)
    return db
      .insert(groupMembershipTable)
      .values(membership)
      .returning()
      .then((rows) => rows[0])
  },

  async end(membershipId: string, endsAt: Date) {
    const [current] = await db
      .select()
      .from(groupMembershipTable)
      .where(eq(groupMembershipTable.id, membershipId))
      .limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Group Membership.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, membershipId)
    return db
      .update(groupMembershipTable)
      .set({ endsAt })
      .where(eq(groupMembershipTable.id, membershipId))
      .returning()
      .then((rows) => rows[0])
  },
}

async function assertUserExists(userId: string) {
  if (!(await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}

async function assertGroupEligible(groupId: GroupId) {
  const target = resolveGroup(groupId)
  if (target?.status !== 'active') throw new EntityDoesNotExistError('Choose an existing Group.', { field: 'groupId' })
  if (target.kind === 'board')
    throw new InvalidRelationshipError('Explicit Group Membership is not valid for the Board.', { field: 'groupId' })
}

async function assertNoOverlap(
  input: { userId: string; groupId: string; startsAt: Date; endsAt: Date | null },
  excludingMembershipId?: string,
) {
  if (
    findOverlappingDatedPeriod(
      await listAll({ userId: input.userId, groupId: input.groupId }),
      input,
      excludingMembershipId,
    )
  )
    throw new DateOverlapError('This User already has a Group Membership in this Group during that period.', {
      field: 'startsAt',
    })
}

async function listAll(input: { userId?: string; groupId?: string }) {
  const [active, previous] = await Promise.all([groupMembership.list(input), groupMembership.listPrevious(input)])
  return [...active, ...previous]
}

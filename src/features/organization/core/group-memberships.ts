import 'server-only'
import { and, asc, eq, gt, isNull, lte, or } from 'drizzle-orm'
import { db } from '@/core/db'
import { getGroup } from '@/core/topology'
import { groupMembership, user } from '@/drizzle/schema'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/features/organization/core/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/features/organization/core/errors'
export const groupMemberships = {
  list(input?: { userId?: string; groupId?: string; at?: Date }) {
    return db
      .select()
      .from(groupMembership)
      .where(
        and(
          input?.userId ? eq(groupMembership.userId, input.userId) : undefined,
          input?.groupId ? eq(groupMembership.groupId, input.groupId) : undefined,
          input?.at
            ? and(
                lte(groupMembership.startsAt, input.at),
                or(isNull(groupMembership.endsAt), gt(groupMembership.endsAt, input.at)),
              )
            : undefined,
        ),
      )
      .orderBy(asc(groupMembership.groupId), asc(groupMembership.userId), asc(groupMembership.startsAt))
  },
  async create(input: { userId: string; groupId: string; startsAt?: Date; endsAt?: Date | null }) {
    const membership = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertUserExists(membership.userId)
    await assertGroupExists(membership.groupId)
    await assertNoOverlap(membership)
    return db
      .insert(groupMembership)
      .values(membership)
      .returning()
      .then((rows) => rows[0])
  },
  async end(membershipId: string, endsAt: Date) {
    const [current] = await db.select().from(groupMembership).where(eq(groupMembership.id, membershipId)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Group Membership.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, membershipId)
    return db
      .update(groupMembership)
      .set({ endsAt })
      .where(eq(groupMembership.id, membershipId))
      .returning()
      .then((rows) => rows[0])
  },
}
async function assertUserExists(userId: string) {
  if (!(await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}
async function assertGroupExists(groupId: string) {
  const group = getGroup(groupId)
  if (group?.status !== 'active') throw new EntityDoesNotExistError('Choose an existing Group.', { field: 'groupId' })
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

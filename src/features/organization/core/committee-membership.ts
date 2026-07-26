import 'server-only'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { resolveGroup } from '@/core/topology'
import { groupMembership } from '@/drizzle/schema'
import { datedPeriodsOverlap, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'

export const committeeMembership = {
  list(input?: { userId?: string; groupId?: string; at?: Date }) {
    return db
      .select()
      .from(groupMembership)
      .where(
        and(
          input?.userId ? eq(groupMembership.userId, input.userId) : undefined,
          input?.groupId ? eq(groupMembership.groupId, input.groupId) : undefined,
        ),
      )
      .orderBy(asc(groupMembership.startsAt))
  },
  async start(input: { userId: string; groupId: string; startsAt?: Date; endsAt?: Date | null }) {
    const target = resolveGroup(input.groupId)
    if (target?.status !== 'active') throw new EntityDoesNotExistError('Choose an existing Group.')
    if (target.kind !== 'committee')
      throw new InvalidRelationshipError('Explicit membership is only valid for Committee Groups.', {
        field: 'groupId',
      })
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    if ((await this.list({ userId: input.userId, groupId: input.groupId })).some((p) => datedPeriodsOverlap(p, period)))
      throw new DateOverlapError('This User already has overlapping Committee Membership.', { field: 'startsAt' })
    return db
      .insert(groupMembership)
      .values(period)
      .returning()
      .then((r) => r[0])
  },
  async end(id: string, endsAt: Date) {
    const [current] = await db.select().from(groupMembership).where(eq(groupMembership.id, id)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Committee Membership.')
    return db
      .update(groupMembership)
      .set({ endsAt })
      .where(eq(groupMembership.id, id))
      .returning()
      .then((r) => r[0])
  },
}

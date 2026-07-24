import 'server-only'

import { and, asc, eq, gt, isNull, lte, or } from 'drizzle-orm'
import { db } from '@/core/db'
import { choir, choirMembership, section, sectionPlacement, user } from '@/drizzle/schema'
import { assertValidDatedPeriod, datedPeriodsOverlap, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'

type Period = { startsAt: Date; endsAt: Date | null }

export const homePlacement = {
  listChoirMemberships(input?: { userId?: string }) {
    return db
      .select()
      .from(choirMembership)
      .where(input?.userId ? eq(choirMembership.userId, input.userId) : undefined)
      .orderBy(asc(choirMembership.startsAt))
  },
  listSectionPlacements(input?: { userId?: string }) {
    return db
      .select()
      .from(sectionPlacement)
      .where(input?.userId ? eq(sectionPlacement.userId, input.userId) : undefined)
      .orderBy(asc(sectionPlacement.startsAt))
  },
  async startChoirMembership(input: { userId: string; choirId: string; startsAt?: Date; endsAt?: Date | null }) {
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertExists(user, input.userId, 'User')
    await assertExists(choir, input.choirId, 'Choir')
    await assertNoOverlap(await this.listChoirMemberships({ userId: input.userId }), period, 'Choir Membership')
    return db
      .insert(choirMembership)
      .values(period)
      .returning()
      .then((r) => r[0])
  },
  async startSectionPlacement(input: { userId: string; sectionId: string; startsAt?: Date; endsAt?: Date | null }) {
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    const [target] = await db.select().from(section).where(eq(section.id, input.sectionId)).limit(1)
    if (!target) throw new EntityDoesNotExistError('Choose an existing Section.', { field: 'sectionId' })
    const memberships = await this.listChoirMemberships({ userId: input.userId })
    if (!memberships.some((m) => m.choirId === target.choirId && covers(m, period)))
      throw new InvalidRelationshipError('Section Placement must be covered by a matching Choir Membership.', {
        field: 'sectionId',
      })
    await assertNoOverlap(await this.listSectionPlacements({ userId: input.userId }), period, 'Section Placement')
    return db
      .insert(sectionPlacement)
      .values(period)
      .returning()
      .then((r) => r[0])
  },
  async endChoirMembership(id: string, endsAt: Date) {
    return endMembership(id, endsAt, true)
  },
  async endSectionPlacement(id: string, endsAt: Date) {
    const [current] = await db.select().from(sectionPlacement).where(eq(sectionPlacement.id, id)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Section Placement.')
    assertValidDatedPeriod({ startsAt: current.startsAt, endsAt })
    return db
      .update(sectionPlacement)
      .set({ endsAt })
      .where(eq(sectionPlacement.id, id))
      .returning()
      .then((r) => r[0])
  },
}

function covers(outer: Period, inner: Period) {
  return outer.startsAt <= inner.startsAt && (!outer.endsAt || (inner.endsAt ? outer.endsAt >= inner.endsAt : false))
}
async function assertExists(table: typeof user | typeof choir, id: string, label: string) {
  if (!(await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1)).length)
    throw new EntityDoesNotExistError(`Choose an existing ${label}.`)
}
async function assertNoOverlap(periods: Period[], period: Period, label: string) {
  if (periods.some((candidate) => datedPeriodsOverlap(candidate, period)))
    throw new DateOverlapError(`This User already has an overlapping ${label}.`, { field: 'startsAt' })
}
async function endMembership(id: string, endsAt: Date, checkDependent: boolean) {
  const [current] = await db.select().from(choirMembership).where(eq(choirMembership.id, id)).limit(1)
  if (!current) throw new EntityDoesNotExistError('Choose an existing Choir Membership.')
  assertValidDatedPeriod({ startsAt: current.startsAt, endsAt })
  if (checkDependent) {
    const placements = await db
      .select()
      .from(sectionPlacement)
      .where(
        and(
          eq(sectionPlacement.userId, current.userId),
          lte(sectionPlacement.startsAt, endsAt),
          or(isNull(sectionPlacement.endsAt), gt(sectionPlacement.endsAt, current.startsAt)),
        ),
      )
    if (placements.some((p) => p.startsAt < endsAt && (!p.endsAt || p.endsAt > endsAt)))
      throw new InvalidRelationshipError('Ending this Choir Membership would leave a Section Placement uncovered.')
  }
  return db
    .update(choirMembership)
    .set({ endsAt })
    .where(eq(choirMembership.id, id))
    .returning()
    .then((r) => r[0])
}

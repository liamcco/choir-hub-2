import 'server-only'

import { and, asc, eq, gt, isNotNull, isNull, lte, or } from 'drizzle-orm'
import { db } from '@/core/db'
import { type ChoirId, resolveChoir, resolveSection, type SectionId } from '@/core/topology'
import type { FineVoice } from '@/core/types'
import { choirMembership, sectionPlacement, user } from '@/drizzle/schema'
import { assertValidDatedPeriod, datedPeriodsOverlap, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'
import { ensureVoiceCapability } from './voice-capability'

type DatedPeriod = { startsAt: Date; endsAt: Date | null }

export const homePlacement = {
  listChoirMemberships(input?: { userId?: string }) {
    return db
      .select()
      .from(choirMembership)
      .where(and(input?.userId ? eq(choirMembership.userId, input.userId) : undefined, isNull(choirMembership.endsAt)))
      .orderBy(asc(choirMembership.startsAt))
  },
  listPreviousChoirMemberships(input?: { userId?: string }) {
    return db
      .select()
      .from(choirMembership)
      .where(
        and(input?.userId ? eq(choirMembership.userId, input.userId) : undefined, isNotNull(choirMembership.endsAt)),
      )
      .orderBy(asc(choirMembership.startsAt))
  },
  listSectionPlacements(input?: { userId?: string }) {
    return db
      .select()
      .from(sectionPlacement)
      .where(
        and(input?.userId ? eq(sectionPlacement.userId, input.userId) : undefined, isNull(sectionPlacement.endsAt)),
      )
      .orderBy(asc(sectionPlacement.startsAt))
  },
  listPreviousSectionPlacements(input?: { userId?: string }) {
    return db
      .select()
      .from(sectionPlacement)
      .where(
        and(input?.userId ? eq(sectionPlacement.userId, input.userId) : undefined, isNotNull(sectionPlacement.endsAt)),
      )
      .orderBy(asc(sectionPlacement.startsAt))
  },
  async startChoirMembership(input: { userId: string; choirId: ChoirId; startsAt?: Date; endsAt?: Date | null }) {
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertUserExists(input.userId)
    const target = resolveChoir(input.choirId)
    if (target?.status !== 'active') throw new EntityDoesNotExistError('Choose an existing Choir.')
    const [active, previous] = await Promise.all([
      this.listChoirMemberships({ userId: input.userId }),
      this.listPreviousChoirMemberships({ userId: input.userId }),
    ])
    await assertNoOverlap([...active, ...previous], period, 'Choir Membership')
    return db
      .insert(choirMembership)
      .values(period)
      .returning()
      .then((r) => r[0])
  },
  async startSectionPlacement(input: {
    userId: string
    sectionId: SectionId
    voice: FineVoice
    startsAt?: Date
    endsAt?: Date | null
  }) {
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    const target = resolveSection(input.sectionId)
    if (target?.status !== 'active')
      throw new EntityDoesNotExistError('Choose an existing Section.', { field: 'sectionId' })
    if (!target.allowedVoices.includes(input.voice))
      throw new InvalidRelationshipError('Choose a Voice allowed by the Section.', { field: 'voice' })
    return db.transaction(async (tx) => {
      await ensureVoiceCapability(tx, { userId: input.userId, voice: input.voice })
      const memberships = await tx.select().from(choirMembership).where(eq(choirMembership.userId, input.userId))
      if (!memberships.some((m) => m.choirId === target.choirId && covers(m, period)))
        throw new InvalidRelationshipError('Section Placement must be covered by a matching Choir Membership.', {
          field: 'sectionId',
        })
      const placements = await tx.select().from(sectionPlacement).where(eq(sectionPlacement.userId, input.userId))
      await assertNoOverlap(placements, period, 'Section Placement')
      return tx
        .insert(sectionPlacement)
        .values(period)
        .returning()
        .then((rows) => rows[0])
    })
  },
  async transfer(input: { userId: string; choirId: ChoirId; sectionId?: SectionId; voice?: FineVoice }) {
    const startsAt = new Date()
    const targetChoir = resolveChoir(input.choirId)
    if (targetChoir?.status !== 'active')
      throw new EntityDoesNotExistError('Choose an existing Choir.', { field: 'choirId' })
    const targetSection = input.sectionId ? resolveSection(input.sectionId) : null
    if (input.sectionId && (targetSection?.status !== 'active' || targetSection.choirId !== input.choirId))
      throw new InvalidRelationshipError('Choose a Section from the selected Choir.', { field: 'sectionId' })
    if (targetSection && (!input.voice || !targetSection.allowedVoices.includes(input.voice)))
      throw new InvalidRelationshipError('Choose a Voice allowed by the Section.', { field: 'voice' })

    return db.transaction(async (tx) => {
      const [memberships, placements] = await Promise.all([
        tx.select().from(choirMembership).where(eq(choirMembership.userId, input.userId)),
        tx.select().from(sectionPlacement).where(eq(sectionPlacement.userId, input.userId)),
      ])
      const currentMembership = memberships.find((row) => row.endsAt === null)
      const currentPlacement = placements.find((row) => row.endsAt === null)

      if (currentMembership?.choirId !== input.choirId) {
        if (currentMembership)
          await tx.update(choirMembership).set({ endsAt: startsAt }).where(eq(choirMembership.id, currentMembership.id))
        await tx
          .insert(choirMembership)
          .values({ userId: input.userId, choirId: input.choirId, startsAt, endsAt: null })
      }
      if (
        currentPlacement &&
        (!targetSection || currentPlacement.sectionId !== targetSection.id || currentPlacement.voice !== input.voice)
      )
        await tx.update(sectionPlacement).set({ endsAt: startsAt }).where(eq(sectionPlacement.id, currentPlacement.id))
      if (
        targetSection &&
        (!currentPlacement || currentPlacement.sectionId !== targetSection.id || currentPlacement.voice !== input.voice)
      ) {
        const voice = input.voice
        if (!voice) throw new InvalidRelationshipError('Choose a Voice allowed by the Section.', { field: 'voice' })
        await ensureVoiceCapability(tx, { userId: input.userId, voice })
        await tx.insert(sectionPlacement).values({
          userId: input.userId,
          sectionId: targetSection.id,
          voice,
          startsAt,
          endsAt: null,
        })
      }
      return { userId: input.userId, startsAt }
    })
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

function covers(outer: DatedPeriod, inner: DatedPeriod) {
  return outer.startsAt <= inner.startsAt && (!outer.endsAt || (inner.endsAt ? outer.endsAt >= inner.endsAt : false))
}
async function assertUserExists(id: string) {
  if (!(await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.')
}
async function assertNoOverlap(periods: DatedPeriod[], period: DatedPeriod, label: string) {
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

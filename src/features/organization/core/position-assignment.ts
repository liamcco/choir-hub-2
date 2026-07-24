import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/core/db'
import {
  choirMembership,
  position,
  positionAssignment as positionAssignmentTable,
  positionScope,
  sectionPlacement,
} from '@/drizzle/schema'
import { datedPeriodsOverlap, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'

export const positionAssignment = {
  async start(input: { positionId: string; userId: string; startsAt?: Date; endsAt?: Date | null }) {
    const period = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    const [target] = await db.select().from(position).where(eq(position.id, input.positionId)).limit(1)
    if (!target) throw new EntityDoesNotExistError('Choose an existing Position.')
    const existing = await db
      .select()
      .from(positionAssignmentTable)
      .where(eq(positionAssignmentTable.positionId, input.positionId))
    if (existing.some((a) => datedPeriodsOverlap(a, period)))
      throw new DateOverlapError('This Position already has a holder during that period.', { field: 'startsAt' })
    const scopes = await db.select().from(positionScope).where(eq(positionScope.positionId, input.positionId))
    const sectionScopes = scopes.filter((s) => s.targetType === 'section' && s.sectionId)
    if (sectionScopes.length) {
      const placements = await db.select().from(sectionPlacement).where(eq(sectionPlacement.userId, input.userId))
      if (!sectionScopes.some((s) => placements.some((p) => p.sectionId === s.sectionId && covers(p, period))))
        throw new InvalidRelationshipError('A Voice Parent must have a covering Section Placement.')
    }
    const choirScopes = scopes.filter((s) => s.targetType === 'choir' && s.choirId)
    if (target.name !== 'Conductor' && choirScopes.length) {
      const memberships = await db.select().from(choirMembership).where(eq(choirMembership.userId, input.userId))
      if (!choirScopes.every((s) => memberships.some((m) => m.choirId === s.choirId && covers(m, period))))
        throw new InvalidRelationshipError('This choir-scoped Position requires matching Choir Membership.')
    }
    return db
      .insert(positionAssignmentTable)
      .values(period)
      .returning()
      .then((r) => r[0])
  },
  list(input?: { positionId?: string; userId?: string; at?: Date }) {
    return db
      .select()
      .from(positionAssignmentTable)
      .where(
        and(
          input?.positionId ? eq(positionAssignmentTable.positionId, input.positionId) : undefined,
          input?.userId ? eq(positionAssignmentTable.userId, input.userId) : undefined,
        ),
      )
  },
  async end(id: string, endsAt: Date) {
    const [a] = await db.select().from(positionAssignmentTable).where(eq(positionAssignmentTable.id, id)).limit(1)
    if (!a) throw new EntityDoesNotExistError('Choose an existing Position Assignment.')
    return db
      .update(positionAssignmentTable)
      .set({ endsAt })
      .where(eq(positionAssignmentTable.id, id))
      .returning()
      .then((r) => r[0])
  },
}
function covers(a: { startsAt: Date; endsAt: Date | null }, b: { startsAt: Date; endsAt: Date | null }) {
  return a.startsAt <= b.startsAt && (!b.endsAt ? !a.endsAt : !!a.endsAt && a.endsAt >= b.endsAt)
}

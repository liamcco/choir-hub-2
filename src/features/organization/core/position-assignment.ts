import 'server-only'

import { and, asc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/core/db'
import { resolvePosition } from '@/core/topology'
import { type FineVoice, isFineVoice } from '@/core/types'
import {
  choirMembership,
  type MemberStatus,
  positionAssignment as positionAssignmentTable,
  sectionPlacement,
  user,
  voiceCapability,
} from '@/drizzle/schema'
import { assertValidDatedPeriod, findOverlappingDatedPeriod, normalizeDatedPeriodInput } from './dated-history'
import { DateOverlapError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'
import {
  evaluatePositionAssignmentEligibility,
  type PositionAssignmentEligibilityFacts,
} from './position-assignment-eligibility'

export const positionAssignment = {
  async start(input: { positionId: string; userId: string; startsAt?: Date; endsAt?: Date | null }) {
    const assignment = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    const target = assertPositionExists(assignment.positionId)
    await assertUserExists(assignment.userId)
    await assertNoOverlap(assignment)

    const facts = await loadEligibilityFacts(assignment.userId)
    const eligibility = evaluatePositionAssignmentEligibility({
      position: target,
      startsAt: assignment.startsAt,
      facts,
    })
    if (!eligibility.eligible)
      throw new InvalidRelationshipError(eligibility.failures.map(({ message }) => message).join(' '))

    return db
      .insert(positionAssignmentTable)
      .values(assignment)
      .returning()
      .then((rows) => rows[0])
  },

  list(input: { positionId?: string; userId?: string } = {}) {
    return db
      .select()
      .from(positionAssignmentTable)
      .where(
        and(
          input.positionId ? eq(positionAssignmentTable.positionId, input.positionId) : undefined,
          input.userId ? eq(positionAssignmentTable.userId, input.userId) : undefined,
          isNull(positionAssignmentTable.endsAt),
        ),
      )
      .orderBy(asc(positionAssignmentTable.positionId), asc(positionAssignmentTable.startsAt))
  },

  listPrevious(input: { positionId?: string; userId?: string } = {}) {
    return db
      .select()
      .from(positionAssignmentTable)
      .where(
        and(
          input.positionId ? eq(positionAssignmentTable.positionId, input.positionId) : undefined,
          input.userId ? eq(positionAssignmentTable.userId, input.userId) : undefined,
          isNotNull(positionAssignmentTable.endsAt),
        ),
      )
      .orderBy(asc(positionAssignmentTable.positionId), asc(positionAssignmentTable.startsAt))
  },

  async end(id: string, endsAt: Date) {
    const [current] = await db.select().from(positionAssignmentTable).where(eq(positionAssignmentTable.id, id)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Position Assignment.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, id)
    return db
      .update(positionAssignmentTable)
      .set({ endsAt })
      .where(eq(positionAssignmentTable.id, id))
      .returning()
      .then((rows) => rows[0])
  },
}

function assertPositionExists(positionId: string) {
  const target = resolvePosition(positionId)
  if (target?.status !== 'active')
    throw new EntityDoesNotExistError('Choose an existing Position.', { field: 'positionId' })
  return target
}

async function assertUserExists(userId: string) {
  if (!(await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}

async function loadEligibilityFacts(userId: string): Promise<PositionAssignmentEligibilityFacts> {
  const [userRow, memberships, placements, capabilities] = await Promise.all([
    db.select({ status: user.status }).from(user).where(eq(user.id, userId)).limit(1),
    db.select().from(choirMembership).where(eq(choirMembership.userId, userId)),
    db.select().from(sectionPlacement).where(eq(sectionPlacement.userId, userId)),
    db.select({ voice: voiceCapability.voice }).from(voiceCapability).where(eq(voiceCapability.userId, userId)),
  ])
  const memberStatus = userRow[0]?.status
  if (!memberStatus) throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
  const finePlacements = placements.filter((placement): placement is typeof placement & { voice: FineVoice } =>
    isFineVoice(placement.voice),
  )
  return {
    memberStatus: memberStatus.toUpperCase() as MemberStatus,
    choirMemberships: memberships,
    sectionPlacements: finePlacements,
    voiceCapabilities: [
      ...finePlacements.map((placement) => placement.voice),
      ...capabilities.flatMap(({ voice }) => (isFineVoice(voice) ? [voice] : [])),
    ],
  }
}

async function assertNoOverlap(
  input: { positionId: string; startsAt: Date; endsAt: Date | null },
  excludingAssignmentId?: string,
) {
  if (findOverlappingDatedPeriod(await listAll({ positionId: input.positionId }), input, excludingAssignmentId))
    throw new DateOverlapError('This Position already has an assignment during that period.', { field: 'startsAt' })
}

async function listAll(input: { positionId?: string; userId?: string }) {
  const [active, previous] = await Promise.all([positionAssignment.list(input), positionAssignment.listPrevious(input)])
  return [...active, ...previous]
}

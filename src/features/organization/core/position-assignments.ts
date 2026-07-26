import 'server-only'
import { and, asc, eq, gt, isNull, lte, or } from 'drizzle-orm'
import { db } from '@/core/db'
import { resolvePosition } from '@/core/topology'
import { positionAssignment, user } from '@/drizzle/schema'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/features/organization/core/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/features/organization/core/errors'
export const positionAssignments = {
  list(input?: { positionId?: string; userId?: string; at?: Date }) {
    return db
      .select()
      .from(positionAssignment)
      .where(
        and(
          input?.positionId ? eq(positionAssignment.positionId, input.positionId) : undefined,
          input?.userId ? eq(positionAssignment.userId, input.userId) : undefined,
          input?.at
            ? and(
                lte(positionAssignment.startsAt, input.at),
                or(isNull(positionAssignment.endsAt), gt(positionAssignment.endsAt, input.at)),
              )
            : undefined,
        ),
      )
      .orderBy(asc(positionAssignment.positionId), asc(positionAssignment.startsAt))
  },
  async create(input: { positionId: string; userId: string; startsAt?: Date; endsAt?: Date | null }) {
    const assignment = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertPositionExists(assignment.positionId)
    await assertUserExists(assignment.userId)
    await assertNoOverlap(assignment)
    return db
      .insert(positionAssignment)
      .values(assignment)
      .returning()
      .then((rows) => rows[0])
  },
  async end(assignmentId: string, endsAt: Date) {
    const [current] = await db.select().from(positionAssignment).where(eq(positionAssignment.id, assignmentId)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Position Assignment.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, assignmentId)
    return db
      .update(positionAssignment)
      .set({ endsAt })
      .where(eq(positionAssignment.id, assignmentId))
      .returning()
      .then((rows) => rows[0])
  },
}
async function assertPositionExists(positionId: string) {
  const position = resolvePosition(positionId)
  if (position?.status !== 'active')
    throw new EntityDoesNotExistError('Choose an existing Position.', { field: 'positionId' })
}
async function assertUserExists(userId: string) {
  if (!(await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}
async function assertNoOverlap(
  input: { positionId: string; startsAt: Date; endsAt: Date | null },
  excludingAssignmentId?: string,
) {
  if (
    findOverlappingDatedPeriod(
      await positionAssignments.list({ positionId: input.positionId }),
      input,
      excludingAssignmentId,
    )
  )
    throw new DateOverlapError('This Position already has an assignment during that period.', { field: 'startsAt' })
}

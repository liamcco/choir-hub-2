import 'server-only'
import { prisma } from '@/core/db'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/features/organization/core/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/features/organization/core/errors'
export const positionAssignments = {
  list(input?: { positionId?: string; userId?: string; at?: Date }) {
    return prisma.positionAssignment.findMany({
      where: {
        positionId: input?.positionId,
        userId: input?.userId,
        ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
      },
      orderBy: [{ positionId: 'asc' }, { startsAt: 'asc' }],
    })
  },
  async create(input: { positionId: string; userId: string; startsAt?: Date; endsAt?: Date | null }) {
    const assignment = normalizeDatedPeriodInput({ ...input, startsAt: input.startsAt ?? new Date() })
    await assertPositionExists(assignment.positionId)
    await assertUserExists(assignment.userId)
    await assertNoOverlap(assignment)
    return prisma.positionAssignment.create({ data: assignment })
  },
  async end(assignmentId: string, endsAt: Date) {
    const current = await prisma.positionAssignment.findUnique({ where: { id: assignmentId } })
    if (!current) throw new EntityDoesNotExistError('Choose an existing Position Assignment.')
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertNoOverlap({ ...current, ...period }, assignmentId)
    return prisma.positionAssignment.update({ where: { id: assignmentId }, data: { endsAt } })
  },
}
async function assertPositionExists(positionId: string) {
  if (!(await prisma.position.findUnique({ where: { id: positionId }, select: { id: true } })))
    throw new EntityDoesNotExistError('Choose an existing Position.', { field: 'positionId' })
}
async function assertUserExists(userId: string) {
  if (!(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })))
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
function currentDatedPeriodWhere(at: Date) {
  return { startsAt: { lte: at }, OR: [{ endsAt: null }, { endsAt: { gt: at } }] }
}

import 'server-only'

import { prisma } from '@/db'
import {
  assertValidDatedPeriod,
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
} from '@/organization/dated-history'
import { DateOverlapError, EntityDoesNotExistError } from '@/organization/errors'

export const positionAssignments = {
  list(input?: { positionId?: string; memberId?: string; at?: Date }) {
    return prisma.positionAssignment.findMany({
      where: {
        positionId: input?.positionId,
        memberId: input?.memberId,
        ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
      },
      orderBy: [{ positionId: 'asc' }, { startsAt: 'asc' }],
    })
  },

  async create(input: { positionId: string; memberId: string; startsAt: Date; endsAt?: Date | null }) {
    const assignment = normalizeDatedPeriodInput(input)
    await assertPositionExists(assignment.positionId)
    await assertMemberExists(assignment.memberId)
    await assertPositionAssignmentDoesNotOverlap(assignment)
    return prisma.positionAssignment.create({ data: assignment })
  },

  async end(assignmentId: string, endsAt: Date) {
    const current = await prisma.positionAssignment.findUnique({ where: { id: assignmentId } })
    if (!current) {
      throw new EntityDoesNotExistError('Choose an existing Position Assignment.')
    }
    const period = { startsAt: current.startsAt, endsAt }
    assertValidDatedPeriod(period)
    await assertPositionAssignmentDoesNotOverlap({ ...current, ...period }, assignmentId)
    return prisma.positionAssignment.update({ where: { id: assignmentId }, data: { endsAt } })
  },
}

async function assertPositionExists(positionId: string) {
  const position = await prisma.position.findUnique({ where: { id: positionId }, select: { id: true } })
  if (!position) {
    throw new EntityDoesNotExistError('Choose an existing Position.', { field: 'positionId' })
  }
}

async function assertMemberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  if (!member) {
    throw new EntityDoesNotExistError('Choose an existing Member.', { field: 'memberId' })
  }
}

async function assertPositionAssignmentDoesNotOverlap(
  input: { positionId: string; startsAt: Date; endsAt: Date | null },
  excludingAssignmentId?: string,
) {
  const assignments = await positionAssignments.list({ positionId: input.positionId })
  if (findOverlappingDatedPeriod(assignments, input, excludingAssignmentId)) {
    throw new DateOverlapError('This Position already has an assignment during that period.', {
      field: 'startsAt',
    })
  }
}

function currentDatedPeriodWhere(at: Date) {
  return { startsAt: { lte: at }, OR: [{ endsAt: null }, { endsAt: { gt: at } }] }
}

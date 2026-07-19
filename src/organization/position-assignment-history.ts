import {
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
  normalizeDatedPeriodUpdate,
} from '@/organization/dated-history'
import { OrganizationDomainError } from '@/organization/errors'
import type {
  CreatePositionAssignmentInput,
  ListPositionAssignmentsInput,
  OrganizationPersistence,
  OrganizationRecord,
  UpdatePositionAssignmentInput,
} from '@/organization/types'

export type PositionAssignmentHistory = {
  listPositionAssignments(input?: ListPositionAssignmentsInput): Promise<OrganizationRecord<'positionAssignment'>[]>
  createPositionAssignment(input: CreatePositionAssignmentInput): Promise<OrganizationRecord<'positionAssignment'>>
  updatePositionAssignment(
    id: string,
    input: UpdatePositionAssignmentInput,
  ): Promise<OrganizationRecord<'positionAssignment'>>
}

export function createPositionAssignmentHistory(persistence: OrganizationPersistence): PositionAssignmentHistory {
  return {
    listPositionAssignments: (input) => persistence.listPositionAssignments(input),
    createPositionAssignment: async (input) => {
      const prepared = preparePositionAssignmentInput(input)
      await assertPositionAssignmentDoesNotOverlap(persistence, prepared)
      return persistence.createPositionAssignment(prepared)
    },
    updatePositionAssignment: async (id, input) => {
      const current = (await persistence.listPositionAssignments()).find((assignment) => assignment.id === id)
      if (!current) {
        return persistence.updatePositionAssignment(id, input)
      }
      const next = preparePositionAssignmentInput({
        positionId: input.positionId ?? current.positionId,
        memberId: input.memberId ?? current.memberId,
        startsAt: input.startsAt ?? current.startsAt,
        endsAt: 'endsAt' in input ? input.endsAt : current.endsAt,
      })
      await assertPositionAssignmentDoesNotOverlap(persistence, next, id)
      return persistence.updatePositionAssignment(id, toUpdateDatedInput(input))
    },
  }
}

async function assertPositionAssignmentDoesNotOverlap(
  persistence: OrganizationPersistence,
  input: Required<CreatePositionAssignmentInput>,
  excludingAssignmentId?: string,
) {
  const candidateAssignments = (await persistence.listPositionAssignments()).filter(
    (assignment) => assignment.positionId === input.positionId,
  )
  const overlappingPeriod = findOverlappingDatedPeriod(candidateAssignments, input, excludingAssignmentId)

  if (overlappingPeriod) {
    throw new OrganizationDomainError(
      'POSITION_ASSIGNMENT_PERIOD_OVERLAP',
      'This Position already has an assignment during that period.',
      { field: 'startsAt' },
    )
  }
}

function preparePositionAssignmentInput(input: CreatePositionAssignmentInput): Required<CreatePositionAssignmentInput> {
  return normalizeDatedPeriodInput(input)
}

function toUpdateDatedInput(input: UpdatePositionAssignmentInput): UpdatePositionAssignmentInput {
  return withoutUndefinedValues(normalizeDatedPeriodUpdate(input))
}

function withoutUndefinedValues<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T
}

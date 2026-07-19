import {
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
  normalizeDatedPeriodUpdate,
} from '@/organization/dated-history'
import { OrganizationDomainError } from '@/organization/errors'
import type {
  CreateGroupInput,
  CreateGroupMembershipInput,
  CreatePositionAssignmentInput,
  CreatePositionInput,
  OrganizationDomain,
  OrganizationPersistence,
  UpdateGroupInput,
  UpdateGroupMembershipInput,
  UpdatePositionAssignmentInput,
  UpdatePositionInput,
} from '@/organization/types'
import { MemberStatus } from '@/prisma/generated/client'

export function createOrganizationDomain(persistence: OrganizationPersistence): OrganizationDomain {
  return {
    listGroups: () => persistence.listGroups(),
    createGroup: async (input) => {
      const prepared = prepareGroupInput(input)
      await assertSiblingGroupNameIsUnique(persistence, prepared)
      return persistence.createGroup(prepared)
    },
    updateGroup: async (id, input) => {
      const current = (await persistence.listGroups()).find((group) => group.id === id)
      if (!current) {
        return persistence.updateGroup(id, input)
      }
      const next = prepareGroupInput({
        kind: input.kind ?? current.kind,
        name: input.name ?? current.name,
        description: 'description' in input ? input.description : current.description,
        parentGroupId: 'parentGroupId' in input ? input.parentGroupId : current.parentGroupId,
      })
      await assertSiblingGroupNameIsUnique(persistence, next, id)
      return persistence.updateGroup(id, toUpdateGroupInput(input))
    },
    listMembers: () => persistence.listMembers(),
    createMember: (input) =>
      persistence.createMember({
        userId: input.userId,
        status: input.status ?? MemberStatus.ACTIVE,
      }),
    updateMember: (id, input) => persistence.updateMember(id, input),
    listGroupMemberships: (input) => persistence.listGroupMemberships(input),
    createGroupMembership: async (input) => {
      const prepared = prepareGroupMembershipInput(input)
      await assertGroupMembershipDoesNotOverlap(persistence, prepared)
      return persistence.createGroupMembership(prepared)
    },
    updateGroupMembership: async (id, input) => {
      const current = (await persistence.listGroupMemberships()).find((membership) => membership.id === id)
      if (!current) {
        return persistence.updateGroupMembership(id, input)
      }
      const next = prepareGroupMembershipInput({
        memberId: input.memberId ?? current.memberId,
        groupId: input.groupId ?? current.groupId,
        startsAt: input.startsAt ?? current.startsAt,
        endsAt: 'endsAt' in input ? input.endsAt : current.endsAt,
      })
      await assertGroupMembershipDoesNotOverlap(persistence, next, id)
      return persistence.updateGroupMembership(id, toUpdateDatedInput(input))
    },
    listPositions: () => persistence.listPositions(),
    createPosition: (input) => persistence.createPosition(preparePositionInput(input)),
    updatePosition: (id, input) => persistence.updatePosition(id, toUpdatePositionInput(input)),
    listPositionScopes: () => persistence.listPositionScopes(),
    createPositionScope: (input) => persistence.createPositionScope(input),
    deletePositionScope: (input) => persistence.deletePositionScope(input),
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

async function assertSiblingGroupNameIsUnique(
  persistence: OrganizationPersistence,
  input: Required<CreateGroupInput>,
  excludingGroupId?: string,
) {
  const duplicate = (await persistence.listGroups()).find(
    (group) =>
      group.id !== excludingGroupId &&
      group.parentGroupId === input.parentGroupId &&
      normalizeGroupName(group.name) === normalizeGroupName(input.name),
  )

  if (duplicate) {
    throw new OrganizationDomainError(
      'DUPLICATE_SIBLING_GROUP_NAME',
      `A sibling Group named "${input.name}" already exists.`,
      { field: 'name' },
    )
  }
}

async function assertGroupMembershipDoesNotOverlap(
  persistence: OrganizationPersistence,
  input: Required<CreateGroupMembershipInput>,
  excludingMembershipId?: string,
) {
  const candidateMemberships = (await persistence.listGroupMemberships()).filter(
    (membership) => membership.memberId === input.memberId && membership.groupId === input.groupId,
  )
  const overlappingPeriod = findOverlappingDatedPeriod(candidateMemberships, input, excludingMembershipId)

  if (overlappingPeriod) {
    throw new OrganizationDomainError(
      'GROUP_MEMBERSHIP_PERIOD_OVERLAP',
      'This Member already has a Group Membership in this Group during that period.',
      { field: 'startsAt' },
    )
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

function prepareGroupInput(input: CreateGroupInput): Required<CreateGroupInput> {
  return {
    kind: input.kind,
    name: input.name.trim(),
    description: normalizeOptionalString(input.description),
    parentGroupId: input.parentGroupId ?? null,
  }
}

function toUpdateGroupInput(input: UpdateGroupInput): UpdateGroupInput {
  return withoutUndefinedValues({
    ...input,
    name: input.name?.trim(),
    description: 'description' in input ? normalizeOptionalString(input.description) : undefined,
    parentGroupId: 'parentGroupId' in input ? (input.parentGroupId ?? null) : undefined,
  })
}

function preparePositionInput(input: CreatePositionInput): Required<CreatePositionInput> {
  return {
    name: input.name.trim(),
    description: normalizeOptionalString(input.description),
  }
}

function toUpdatePositionInput(input: UpdatePositionInput): UpdatePositionInput {
  return withoutUndefinedValues({
    ...input,
    name: input.name?.trim(),
    description: 'description' in input ? normalizeOptionalString(input.description) : undefined,
  })
}

function prepareGroupMembershipInput(input: CreateGroupMembershipInput): Required<CreateGroupMembershipInput> {
  return prepareDatedInput(input)
}

function preparePositionAssignmentInput(input: CreatePositionAssignmentInput): Required<CreatePositionAssignmentInput> {
  return prepareDatedInput(input)
}

function prepareDatedInput<T extends CreateGroupMembershipInput | CreatePositionAssignmentInput>(
  input: T,
): T & { endsAt: Date | null } {
  return normalizeDatedPeriodInput(input)
}

function toUpdateDatedInput<T extends UpdateGroupMembershipInput | UpdatePositionAssignmentInput>(input: T): T {
  return withoutUndefinedValues(normalizeDatedPeriodUpdate(input))
}

function normalizeGroupName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function withoutUndefinedValues<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T
}

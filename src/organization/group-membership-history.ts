import {
  findOverlappingDatedPeriod,
  normalizeDatedPeriodInput,
  normalizeDatedPeriodUpdate,
} from '@/organization/dated-history'
import { OrganizationDomainError } from '@/organization/errors'
import type {
  CreateGroupMembershipInput,
  ListGroupMembershipsInput,
  OrganizationPersistence,
  OrganizationRecord,
  UpdateGroupMembershipInput,
} from '@/organization/types'

export type GroupMembershipHistory = {
  listGroupMemberships(input?: ListGroupMembershipsInput): Promise<OrganizationRecord<'groupMembership'>[]>
  createGroupMembership(input: CreateGroupMembershipInput): Promise<OrganizationRecord<'groupMembership'>>
  updateGroupMembership(id: string, input: UpdateGroupMembershipInput): Promise<OrganizationRecord<'groupMembership'>>
}

export function createGroupMembershipHistory(persistence: OrganizationPersistence): GroupMembershipHistory {
  return {
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

function prepareGroupMembershipInput(input: CreateGroupMembershipInput): Required<CreateGroupMembershipInput> {
  return normalizeDatedPeriodInput(input)
}

function toUpdateDatedInput(input: UpdateGroupMembershipInput): UpdateGroupMembershipInput {
  return withoutUndefinedValues(normalizeDatedPeriodUpdate(input))
}

function withoutUndefinedValues<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T
}

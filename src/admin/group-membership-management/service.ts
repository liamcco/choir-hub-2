import { type AccessActor, canAccessAdminSurface } from '@/admin/access-policy'
import { formatGroupPath } from '@/admin/group-management/group-labels'
import type { AuthAdminGateway, AuthUserAccount } from '@/admin/member-management/account-lifecycle'
import {
  type GroupMembershipHistory,
  type GroupStructure,
  type MemberRegistry,
  OrganizationDomainError,
  type OrganizationRecord,
} from '@/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod, isScheduledDatedPeriod } from '@/organization/dated-history'
import type { CreateGroupMembershipInput } from '@/organization/types'

export type GroupMembershipManagementActor = AccessActor

export type GroupMembershipPeriod = OrganizationRecord<'groupMembership'> & {
  group: OrganizationRecord<'group'>
  member: OrganizationRecord<'member'>
  memberLabel: string
  memberDetail: string
}

export type GroupMembershipGroupView = {
  group: OrganizationRecord<'group'>
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export type GroupMembershipMemberView = {
  member: OrganizationRecord<'member'>
  memberLabel: string
  memberDetail: string
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export type GroupMembershipManagementState = {
  groups: OrganizationRecord<'group'>[]
  members: GroupMembershipMemberOption[]
  groupViews: GroupMembershipGroupView[]
  memberViews: GroupMembershipMemberView[]
}

export type GroupMembershipMemberOption = {
  member: OrganizationRecord<'member'>
  label: string
  detail: string
}

export type EndGroupMembershipInput = {
  endsAt: Date
}

export type GroupMembershipManagementService = {
  listGroupMembershipManagement(
    actor: GroupMembershipManagementActor,
    input?: { at?: Date },
  ): Promise<GroupMembershipManagementState>
  createGroupMembership(
    actor: GroupMembershipManagementActor,
    input: CreateGroupMembershipInput,
  ): Promise<OrganizationRecord<'groupMembership'>>
  endGroupMembership(
    actor: GroupMembershipManagementActor,
    membershipId: string,
    input: EndGroupMembershipInput,
  ): Promise<OrganizationRecord<'groupMembership'>>
}

export class GroupMembershipManagementAuthorizationError extends Error {
  constructor() {
    super('Only admins can manage Group Memberships.')
    this.name = 'GroupMembershipManagementAuthorizationError'
  }
}

export class GroupMembershipManagementValidationError extends Error {
  readonly fieldErrors: Partial<Record<keyof CreateGroupMembershipInput | keyof EndGroupMembershipInput, string>>

  constructor(
    message: string,
    fieldErrors: Partial<Record<keyof CreateGroupMembershipInput | keyof EndGroupMembershipInput, string>>,
  ) {
    super(message)
    this.name = 'GroupMembershipManagementValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function createGroupMembershipManagementService({
  authGateway,
  groupMembershipHistory,
  groupStructure,
  memberRegistry,
}: {
  authGateway?: Pick<AuthAdminGateway, 'listUsers'>
  groupMembershipHistory: GroupMembershipHistory
  groupStructure: GroupStructure
  memberRegistry: MemberRegistry
}): GroupMembershipManagementService {
  return {
    async listGroupMembershipManagement(actor, input) {
      assertAdmin(actor)
      const [groups, members, memberships, users] = await Promise.all([
        groupStructure.listGroups(),
        memberRegistry.listMembers(),
        groupMembershipHistory.listGroupMemberships(),
        authGateway?.listUsers() ?? Promise.resolve([]),
      ])
      return buildGroupMembershipManagementState({
        groups,
        members,
        memberships,
        users,
        at: input?.at ?? new Date(),
      })
    },
    async createGroupMembership(actor, input) {
      assertAdmin(actor)
      return mapValidationErrors(() => groupMembershipHistory.createGroupMembership(input))
    },
    async endGroupMembership(actor, membershipId, input) {
      assertAdmin(actor)
      return mapValidationErrors(() =>
        groupMembershipHistory.updateGroupMembership(membershipId, { endsAt: input.endsAt }),
      )
    },
  }
}

export function buildGroupMembershipManagementState({
  groups,
  members,
  memberships,
  users = [],
  at,
}: {
  groups: OrganizationRecord<'group'>[]
  members: OrganizationRecord<'member'>[]
  memberships: OrganizationRecord<'groupMembership'>[]
  users?: Pick<AuthUserAccount, 'id' | 'name' | 'email'>[]
  at: Date
}): GroupMembershipManagementState {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const memberOptions = buildMemberOptions(members, users)
  const memberOptionsByMemberId = new Map(memberOptions.map((option) => [option.member.id, option]))
  const periods = memberships
    .flatMap((membership): GroupMembershipPeriod[] => {
      const group = groupsById.get(membership.groupId)
      const member = membersById.get(membership.memberId)
      const memberOption = member ? memberOptionsByMemberId.get(member.id) : undefined
      return group && member && memberOption
        ? [{ ...membership, group, member, memberLabel: memberOption.label, memberDetail: memberOption.detail }]
        : []
    })
    .sort(compareMembershipPeriods(groups))

  return {
    groups,
    members: memberOptions,
    groupViews: groups.map((group) => {
      const groupPeriods = periods.filter((membership) => membership.groupId === group.id)
      return {
        group,
        ...partitionMembershipPeriods(groupPeriods, at),
      }
    }),
    memberViews: memberOptions.map((option) => {
      const member = option.member
      const memberPeriods = periods.filter((membership) => membership.memberId === member.id)
      return {
        member,
        memberLabel: option.label,
        memberDetail: option.detail,
        ...partitionMembershipPeriods(memberPeriods, at),
      }
    }),
  }
}

function compareMembershipPeriods(groups: OrganizationRecord<'group'>[]) {
  return (first: GroupMembershipPeriod, second: GroupMembershipPeriod) =>
    first.memberLabel.localeCompare(second.memberLabel) ||
    formatGroupPath(groups, first.group).localeCompare(formatGroupPath(groups, second.group)) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
}

function partitionMembershipPeriods(periods: GroupMembershipPeriod[], at: Date) {
  return {
    currentMemberships: periods.filter((membership) => isCurrentDatedPeriod(membership, at)),
    scheduledMemberships: periods.filter((membership) => isScheduledDatedPeriod(membership, at)),
    historicalMemberships: periods.filter((membership) => isHistoricalDatedPeriod(membership, at)),
  }
}

export function formatMemberFallbackLabel(member: OrganizationRecord<'member'>) {
  return `Member ${member.id}`
}

function buildMemberOptions(
  members: OrganizationRecord<'member'>[],
  users: Pick<AuthUserAccount, 'id' | 'name' | 'email'>[],
): GroupMembershipMemberOption[] {
  const usersById = new Map(users.map((user) => [user.id, user]))
  return members.map((member) => {
    const user = usersById.get(member.userId)
    return {
      member,
      label: user?.name || formatMemberFallbackLabel(member),
      detail: user?.email ?? member.id,
    }
  })
}

async function mapValidationErrors<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof OrganizationDomainError) {
      throw new GroupMembershipManagementValidationError(error.message, {
        [error.field ?? 'startsAt']: error.message,
      })
    }
    throw error
  }
}

function assertAdmin(actor: GroupMembershipManagementActor | null | undefined) {
  if (!canAccessAdminSurface(actor)) {
    throw new GroupMembershipManagementAuthorizationError()
  }
}

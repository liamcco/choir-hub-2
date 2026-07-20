import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildMemberLabels, formatGroupPath } from '@/features/organization/core/labels'
import type { Group, GroupMembership, Member } from '@/prisma/generated/client'

export type GroupMembershipPeriod = GroupMembership & {
  group: Group
  member: Member
  memberLabel: string
  memberDetail: string
}

export type GroupMembershipGroupView = {
  group: Group
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export type GroupMembershipMemberView = {
  member: Member
  memberLabel: string
  memberDetail: string
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export async function listGroupMembershipManagement(input?: { at?: Date }) {
  const [groups, members, memberships, users] = await Promise.all([
    organizationService.groups.list(),
    organizationService.members.list(),
    organizationService.groupMemberships.list(),
    organizationService.members.listIdentities(),
  ])
  return buildGroupMembershipManagementState({
    groups,
    members,
    memberships,
    users,
    at: input?.at ?? new Date(),
  })
}

export type GroupMembershipManagementState = Awaited<ReturnType<typeof listGroupMembershipManagement>>

export function buildGroupMembershipManagementState({
  groups,
  members,
  memberships,
  users = [],
  at,
}: {
  groups: Group[]
  members: Member[]
  memberships: GroupMembership[]
  users?: { id: string; name: string; email: string }[]
  at: Date
}) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const memberOptions = buildMemberLabels(members, users)
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
    .sort(
      (first, second) =>
        first.memberLabel.localeCompare(second.memberLabel) ||
        formatGroupPath(groups, first.group).localeCompare(formatGroupPath(groups, second.group)) ||
        first.startsAt.getTime() - second.startsAt.getTime() ||
        first.id.localeCompare(second.id),
    )

  return {
    groups,
    members: memberOptions,
    groupViews: groups.map(
      (group): GroupMembershipGroupView => ({
        group,
        ...partitionMembershipPeriods(
          periods.filter((membership) => membership.groupId === group.id),
          at,
        ),
      }),
    ),
    memberViews: memberOptions.map(
      (option): GroupMembershipMemberView => ({
        member: option.member,
        memberLabel: option.label,
        memberDetail: option.detail,
        ...partitionMembershipPeriods(
          periods.filter((membership) => membership.memberId === option.member.id),
          at,
        ),
      }),
    ),
  }
}

function partitionMembershipPeriods(periods: GroupMembershipPeriod[], at: Date) {
  return {
    currentMemberships: periods.filter((membership) => isCurrentDatedPeriod(membership, at)),
    scheduledMemberships: periods.filter((membership) => isScheduledDatedPeriod(membership, at)),
    historicalMemberships: periods.filter((membership) => isHistoricalDatedPeriod(membership, at)),
  }
}

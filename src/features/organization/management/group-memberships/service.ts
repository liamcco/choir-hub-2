import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildUserLabels, formatGroupPath } from '@/features/organization/core/labels'
import type { Group, GroupMembership, User } from '@/prisma/generated/client'

export type GroupMembershipPeriod = GroupMembership & {
  group: Group
  user: User
  userLabel: string
  userDetail: string
}

export type GroupMembershipGroupView = {
  group: Group
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export type GroupMembershipUserView = {
  user: User
  userLabel: string
  userDetail: string
  currentMemberships: GroupMembershipPeriod[]
  scheduledMemberships: GroupMembershipPeriod[]
  historicalMemberships: GroupMembershipPeriod[]
}

export async function listGroupMembershipManagement(input?: { at?: Date }) {
  const [groups, users, memberships] = await Promise.all([
    organizationService.groups.list(),
    organizationService.users.list(),
    organizationService.groupMemberships.list(),
  ])
  return buildGroupMembershipManagementState({
    groups,
    memberships,
    users,
    at: input?.at ?? new Date(),
  })
}

export type GroupMembershipManagementState = Awaited<ReturnType<typeof listGroupMembershipManagement>>

export function buildGroupMembershipManagementState({
  groups,
  memberships,
  users,
  at,
}: {
  groups: Group[]
  memberships: GroupMembership[]
  users: User[]
  at: Date
}) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const usersById = new Map(users.map((user) => [user.id, user]))
  const userOptions = buildUserLabels(users)
  const userOptionsById = new Map(userOptions.map((option) => [option.user.id, option]))
  const periods = memberships
    .flatMap((membership): GroupMembershipPeriod[] => {
      const group = groupsById.get(membership.groupId)
      const user = usersById.get(membership.userId)
      const userOption = user ? userOptionsById.get(user.id) : undefined
      return group && user && userOption
        ? [{ ...membership, group, user, userLabel: userOption.label, userDetail: userOption.detail }]
        : []
    })
    .sort(
      (first, second) =>
        first.userLabel.localeCompare(second.userLabel) ||
        formatGroupPath(groups, first.group).localeCompare(formatGroupPath(groups, second.group)) ||
        first.startsAt.getTime() - second.startsAt.getTime() ||
        first.id.localeCompare(second.id),
    )

  return {
    groups,
    users: userOptions,
    groupViews: groups.map(
      (group): GroupMembershipGroupView => ({
        group,
        ...partitionMembershipPeriods(
          periods.filter((membership) => membership.groupId === group.id),
          at,
        ),
      }),
    ),
    userViews: userOptions.map(
      (option): GroupMembershipUserView => ({
        user: option.user,
        userLabel: option.label,
        userDetail: option.detail,
        ...partitionMembershipPeriods(
          periods.filter((membership) => membership.userId === option.user.id),
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

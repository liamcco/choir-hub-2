import 'server-only'

import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildGroupTree, type GroupTreeNode } from '@/features/organization/core/group-tree'
import { buildUserLabels } from '@/features/organization/core/labels'
import type { Group, GroupMembership, MemberStatus, User } from '@/prisma/generated/client'

async function listGroupStructure(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, currentMemberships] = await Promise.all([
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ at }),
  ])
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const directMemberCountByGroupId = new Map<string, number>()

  for (const membership of currentMemberships) {
    directMemberCountByGroupId.set(membership.groupId, (directMemberCountByGroupId.get(membership.groupId) ?? 0) + 1)
  }

  return groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      kind: group.kind,
      parentName: group.parentGroupId ? (groupsById.get(group.parentGroupId)?.name ?? null) : null,
      directMemberCount: directMemberCountByGroupId.get(group.id) ?? 0,
    }))
    .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

async function getGroupDetail(groupId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, memberships, users] = await Promise.all([
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ groupId }),
    organizationService.users.list(),
  ])
  const group = groups.find((candidate) => candidate.id === groupId)
  if (!group) return null

  const memberOptions = buildUserLabels(users).sort(
    (first, second) => first.label.localeCompare(second.label) || first.user.id.localeCompare(second.user.id),
  )
  const memberOptionsById = new Map(memberOptions.map((option) => [option.user.id, option]))
  const membershipViews = memberships.flatMap((membership) => {
    const option = memberOptionsById.get(membership.userId)
    return option ? [{ ...membership, userLabel: option.label, userDetail: option.detail }] : []
  })

  return {
    ...group,
    parentName: group.parentGroupId
      ? (groups.find((candidate) => candidate.id === group.parentGroupId)?.name ?? null)
      : null,
    groups,
    users: memberOptions,
    currentMemberships: membershipViews
      .filter((membership) => isCurrentDatedPeriod(membership, at))
      .sort(compareMemberships),
    scheduledMemberships: membershipViews
      .filter((membership) => isScheduledDatedPeriod(membership, at))
      .sort(compareMemberships),
    historicalMemberships: membershipViews
      .filter((membership) => isHistoricalDatedPeriod(membership, at))
      .sort(
        (first, second) =>
          (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || compareMemberships(first, second),
      ),
  }
}

async function getHierarchy(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, users, memberships] = await Promise.all([
    organizationService.groups.list(),
    organizationService.users.list(),
    organizationService.groupMemberships.list({ at }),
  ])
  return buildGroupHierarchy(groups, users, memberships, at)
}

export const listGroupCollection = listGroupStructure
export { getGroupDetail, getHierarchy as getGroupHierarchy }

export type GroupHierarchyRow = {
  id: string
  name: string
  kind: Group['kind']
  depth: number
  memberCounts: Record<MemberStatus, number>
}

/** Builds the screen-shaped tree read, counting each current Member once per subtree. */
export function buildGroupHierarchy(
  groups: Group[],
  members: User[],
  memberships: GroupMembership[],
  at: Date,
): GroupHierarchyRow[] {
  const membersById = new Map(members.map((member) => [member.id, member]))
  const currentUserIdsByGroupId = new Map<string, Set<string>>()

  for (const membership of memberships) {
    if (!isCurrentDatedPeriod(membership, at) || !membersById.has(membership.userId)) continue
    const userIds = currentUserIdsByGroupId.get(membership.groupId) ?? new Set<string>()
    userIds.add(membership.userId)
    currentUserIdsByGroupId.set(membership.groupId, userIds)
  }

  return flattenHierarchy(buildGroupTree(groups), currentUserIdsByGroupId, membersById)
}

function flattenHierarchy(
  nodes: GroupTreeNode[],
  currentUserIdsByGroupId: Map<string, Set<string>>,
  membersById: Map<string, User>,
): GroupHierarchyRow[] {
  return nodes.flatMap((node) => {
    const descendantUserIds = collectDescendantUserIds(node, currentUserIdsByGroupId)
    const memberCounts: Record<MemberStatus, number> = { ACTIVE: 0, PASSIVE: 0, FORMER: 0 }
    for (const userId of descendantUserIds) {
      const user = membersById.get(userId)
      if (user) memberCounts[user.status] += 1
    }

    return [
      { id: node.group.id, name: node.group.name, kind: node.group.kind, depth: node.depth, memberCounts },
      ...flattenHierarchy(node.children, currentUserIdsByGroupId, membersById),
    ]
  })
}

function collectDescendantUserIds(node: GroupTreeNode, currentUserIdsByGroupId: Map<string, Set<string>>) {
  const userIds = new Set(currentUserIdsByGroupId.get(node.group.id))
  for (const child of node.children) {
    for (const userId of collectDescendantUserIds(child, currentUserIdsByGroupId)) userIds.add(userId)
  }
  return userIds
}

function compareMemberships(
  first: { id: string; userLabel: string; startsAt: Date },
  second: { id: string; userLabel: string; startsAt: Date },
) {
  return (
    first.userLabel.localeCompare(second.userLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

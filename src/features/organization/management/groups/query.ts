import 'server-only'

import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildGroupTree, type GroupTreeNode } from '@/features/organization/core/group-tree'
import { buildMemberLabels } from '@/features/organization/core/labels'
import type { Group, GroupMembership, Member, MemberStatus } from '@/prisma/generated/client'

async function listCollection(input?: { at?: Date }) {
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

async function getDetail(groupId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, memberships, members, identities] = await Promise.all([
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ groupId }),
    organizationService.members.list(),
    organizationService.members.listIdentities(),
  ])
  const group = groups.find((candidate) => candidate.id === groupId)
  if (!group) return null

  const memberOptions = buildMemberLabels(members, identities).sort(
    (first, second) => first.label.localeCompare(second.label) || first.member.id.localeCompare(second.member.id),
  )
  const memberOptionsById = new Map(memberOptions.map((option) => [option.member.id, option]))
  const membershipViews = memberships.flatMap((membership) => {
    const option = memberOptionsById.get(membership.memberId)
    return option ? [{ ...membership, memberLabel: option.label, memberDetail: option.detail }] : []
  })

  return {
    ...group,
    parentName: group.parentGroupId
      ? (groups.find((candidate) => candidate.id === group.parentGroupId)?.name ?? null)
      : null,
    groups,
    members: memberOptions,
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
  const [groups, members, memberships] = await Promise.all([
    organizationService.groups.list(),
    organizationService.members.list(),
    organizationService.groupMemberships.list({ at }),
  ])
  return buildGroupHierarchy(groups, members, memberships, at)
}

export const groupManagementQuery = { listCollection, getDetail, getHierarchy }

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
  members: Member[],
  memberships: GroupMembership[],
  at: Date,
): GroupHierarchyRow[] {
  const membersById = new Map(members.map((member) => [member.id, member]))
  const currentMemberIdsByGroupId = new Map<string, Set<string>>()

  for (const membership of memberships) {
    if (!isCurrentDatedPeriod(membership, at) || !membersById.has(membership.memberId)) continue
    const memberIds = currentMemberIdsByGroupId.get(membership.groupId) ?? new Set<string>()
    memberIds.add(membership.memberId)
    currentMemberIdsByGroupId.set(membership.groupId, memberIds)
  }

  return flattenHierarchy(buildGroupTree(groups), currentMemberIdsByGroupId, membersById)
}

function flattenHierarchy(
  nodes: GroupTreeNode[],
  currentMemberIdsByGroupId: Map<string, Set<string>>,
  membersById: Map<string, Member>,
): GroupHierarchyRow[] {
  return nodes.flatMap((node) => {
    const descendantMemberIds = collectDescendantMemberIds(node, currentMemberIdsByGroupId)
    const memberCounts: Record<MemberStatus, number> = { ACTIVE: 0, PASSIVE: 0, FORMER: 0 }
    for (const memberId of descendantMemberIds) {
      const member = membersById.get(memberId)
      if (member) memberCounts[member.status] += 1
    }

    return [
      { id: node.group.id, name: node.group.name, kind: node.group.kind, depth: node.depth, memberCounts },
      ...flattenHierarchy(node.children, currentMemberIdsByGroupId, membersById),
    ]
  })
}

function collectDescendantMemberIds(node: GroupTreeNode, currentMemberIdsByGroupId: Map<string, Set<string>>) {
  const memberIds = new Set(currentMemberIdsByGroupId.get(node.group.id))
  for (const child of node.children) {
    for (const memberId of collectDescendantMemberIds(child, currentMemberIdsByGroupId)) memberIds.add(memberId)
  }
  return memberIds
}

function compareMemberships(
  first: { id: string; memberLabel: string; startsAt: Date },
  second: { id: string; memberLabel: string; startsAt: Date },
) {
  return (
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

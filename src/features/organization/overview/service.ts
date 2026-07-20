import 'server-only'

import { prisma } from '@/core/db'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import {
  type AuthUserIdentity,
  buildMemberLabels,
  formatGroupPath,
  formatMemberFallbackLabel,
  formatPositionScopeLabel,
  noGroupScopesLabel,
} from '@/features/organization/core/labels'
import type {
  Group,
  GroupMembership,
  Member,
  Position,
  PositionAssignment,
  PositionScope,
} from '@/prisma/generated/client'

export type OverviewGroupHierarchyNode = {
  group: Group
  depth: number
  children: OverviewGroupHierarchyNode[]
}

export type OverviewGroupMembershipPeriod = GroupMembership & {
  group: Group
  groupPath: string
}

export type OverviewPositionScope = PositionScope & {
  group: Group
  groupPath: string
}

export type OverviewPositionAssignmentPeriod = PositionAssignment & {
  position: Position
  member: Member
  positionLabel: string
  positionScopeLabel: string
  memberLabel: string
  memberDetail: string
}

export type OverviewMemberView = {
  member: Member
  memberLabel: string
  memberDetail: string
  currentMemberships: OverviewGroupMembershipPeriod[]
  historicalMemberships: OverviewGroupMembershipPeriod[]
  currentAssignments: OverviewPositionAssignmentPeriod[]
  historicalAssignments: OverviewPositionAssignmentPeriod[]
}

export type OverviewPositionView = {
  position: Position
  scopes: OverviewPositionScope[]
  scopeLabel: string
  currentAssignments: OverviewPositionAssignmentPeriod[]
  historicalAssignments: OverviewPositionAssignmentPeriod[]
}

export type OrganizationOverviewState = {
  groups: Group[]
  groupHierarchy: OverviewGroupHierarchyNode[]
  memberViews: OverviewMemberView[]
  positionViews: OverviewPositionView[]
}

export async function listOrganizationOverview(input?: { at?: Date }) {
  const [groups, members, memberships, positions, scopes, assignments, users] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
    }),
    prisma.member.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }),
    prisma.groupMembership.findMany({
      orderBy: [{ groupId: 'asc' }, { memberId: 'asc' }, { startsAt: 'asc' }],
    }),
    prisma.position.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
    prisma.positionScope.findMany({ orderBy: [{ positionId: 'asc' }, { groupId: 'asc' }] }),
    prisma.positionAssignment.findMany({ orderBy: [{ positionId: 'asc' }, { startsAt: 'asc' }] }),
    prisma.user.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, email: true },
    }),
  ])
  return buildOrganizationOverviewState({
    groups,
    members,
    memberships,
    positions,
    scopes,
    assignments,
    users,
    at: input?.at ?? new Date(),
  })
}

export function buildOrganizationOverviewState({
  groups,
  members,
  memberships,
  positions,
  scopes,
  assignments,
  users = [],
  at,
}: {
  groups: Group[]
  members: Member[]
  memberships: GroupMembership[]
  positions: Position[]
  scopes: PositionScope[]
  assignments: PositionAssignment[]
  users?: AuthUserIdentity[]
  at: Date
}): OrganizationOverviewState {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const memberLabels = new Map(
    buildMemberLabels(members, users).map((memberLabel) => [memberLabel.member.id, memberLabel]),
  )
  const positionScopesByPositionId = groupPositionScopes({ groups, scopes })
  const positionScopeLabels = buildPositionScopeLabels({ groups, positions, positionScopesByPositionId })

  const membershipPeriods = memberships
    .flatMap((membership): OverviewGroupMembershipPeriod[] => {
      const group = groupsById.get(membership.groupId)
      return group ? [{ ...membership, group, groupPath: formatGroupPath(groups, group) }] : []
    })
    .sort(compareGroupMembershipPeriods)

  const assignmentPeriods = assignments
    .flatMap((assignment): OverviewPositionAssignmentPeriod[] => {
      const position = positions.find((candidate) => candidate.id === assignment.positionId)
      const member = membersById.get(assignment.memberId)
      const memberLabel = member ? memberLabels.get(member.id) : undefined
      return position && member && memberLabel
        ? [
            {
              ...assignment,
              position,
              member,
              positionLabel: position.name,
              positionScopeLabel: positionScopeLabels.get(position.id) ?? noGroupScopesLabel,
              memberLabel: memberLabel.label,
              memberDetail: memberLabel.detail,
            },
          ]
        : []
    })
    .sort(comparePositionAssignmentPeriods)

  return {
    groups,
    groupHierarchy: buildOverviewGroupHierarchy(groups),
    memberViews: members.map((member) => {
      const memberLabel = memberLabels.get(member.id) ?? { label: formatMemberFallbackLabel(member), detail: member.id }
      const memberMemberships = membershipPeriods.filter((membership) => membership.memberId === member.id)
      const memberAssignments = assignmentPeriods.filter((assignment) => assignment.memberId === member.id)
      return {
        member,
        memberLabel: memberLabel.label,
        memberDetail: memberLabel.detail,
        currentMemberships: memberMemberships.filter((membership) => isCurrentDatedPeriod(membership, at)),
        historicalMemberships: memberMemberships.filter((membership) => isHistoricalDatedPeriod(membership, at)),
        currentAssignments: memberAssignments.filter((assignment) => isCurrentDatedPeriod(assignment, at)),
        historicalAssignments: memberAssignments.filter((assignment) => isHistoricalDatedPeriod(assignment, at)),
      }
    }),
    positionViews: positions.map((position) => {
      const positionAssignments = assignmentPeriods.filter((assignment) => assignment.positionId === position.id)
      const positionScopes = positionScopesByPositionId.get(position.id) ?? []
      return {
        position,
        scopes: positionScopes,
        scopeLabel: positionScopeLabels.get(position.id) ?? noGroupScopesLabel,
        currentAssignments: positionAssignments.filter((assignment) => isCurrentDatedPeriod(assignment, at)),
        historicalAssignments: positionAssignments.filter((assignment) => isHistoricalDatedPeriod(assignment, at)),
      }
    }),
  }
}

export function buildOverviewGroupHierarchy(groups: Group[]): OverviewGroupHierarchyNode[] {
  const nodes = new Map<string, OverviewGroupHierarchyNode>()
  const roots: OverviewGroupHierarchyNode[] = []

  for (const group of groups) {
    nodes.set(group.id, { group, depth: 0, children: [] })
  }

  for (const group of groups) {
    const node = nodes.get(group.id)
    if (!node) {
      continue
    }

    const parent = group.parentGroupId ? nodes.get(group.parentGroupId) : undefined
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  assignGroupHierarchyDepths(roots, 0)
  sortGroupHierarchy(roots)
  return roots
}

function assignGroupHierarchyDepths(nodes: OverviewGroupHierarchyNode[], depth: number) {
  for (const node of nodes) {
    node.depth = depth
    assignGroupHierarchyDepths(node.children, depth + 1)
  }
}

function sortGroupHierarchy(nodes: OverviewGroupHierarchyNode[]) {
  nodes.sort(compareGroupHierarchyNodes)
  for (const node of nodes) {
    sortGroupHierarchy(node.children)
  }
}

function compareGroupHierarchyNodes(first: OverviewGroupHierarchyNode, second: OverviewGroupHierarchyNode) {
  return first.group.name.localeCompare(second.group.name) || first.group.id.localeCompare(second.group.id)
}

function groupPositionScopes({ groups, scopes }: { groups: Group[]; scopes: PositionScope[] }) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const scopesByPositionId = new Map<string, OverviewPositionScope[]>()
  for (const scope of scopes) {
    const group = groupsById.get(scope.groupId)
    if (!group) {
      continue
    }
    scopesByPositionId.set(scope.positionId, [
      ...(scopesByPositionId.get(scope.positionId) ?? []),
      {
        ...scope,
        group,
        groupPath: formatGroupPath(groups, group),
      },
    ])
  }
  for (const positionScopes of scopesByPositionId.values()) {
    positionScopes.sort((first, second) => first.groupPath.localeCompare(second.groupPath))
  }
  return scopesByPositionId
}

function buildPositionScopeLabels({
  groups,
  positions,
  positionScopesByPositionId,
}: {
  groups: Group[]
  positions: Position[]
  positionScopesByPositionId: Map<string, OverviewPositionScope[]>
}) {
  return new Map(
    positions.map((position) => {
      const positionScopes = positionScopesByPositionId.get(position.id) ?? []
      return [
        position.id,
        formatPositionScopeLabel(
          groups,
          positionScopes.map((scope) => scope.group),
        ),
      ]
    }),
  )
}

function compareGroupMembershipPeriods(first: OverviewGroupMembershipPeriod, second: OverviewGroupMembershipPeriod) {
  return (
    first.groupPath.localeCompare(second.groupPath) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

function comparePositionAssignmentPeriods(
  first: OverviewPositionAssignmentPeriod,
  second: OverviewPositionAssignmentPeriod,
) {
  return (
    first.positionLabel.localeCompare(second.positionLabel) ||
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

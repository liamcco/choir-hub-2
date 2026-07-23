import 'server-only'

import { prisma } from '@/core/db'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildGroupPathLabels, buildGroupTree, type GroupTreeNode } from '@/features/organization/core/group-tree'
import {
  buildUserLabels,
  formatPositionScopeLabel,
  formatUserFallbackLabel,
  noGroupScopesLabel,
} from '@/features/organization/core/labels'
import type {
  Group,
  GroupMembership,
  Position,
  PositionAssignment,
  PositionScope,
  User,
} from '@/prisma/generated/client'

export type OverviewGroupHierarchyNode = GroupTreeNode<Group>

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
  member: User
  positionLabel: string
  positionScopeLabel: string
  memberLabel: string
  memberDetail: string
}

export type OverviewMemberView = {
  member: User
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
  const [groups, users, memberships, positions, scopes, assignments] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
    }),
    prisma.user.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    }),
    prisma.groupMembership.findMany({
      orderBy: [{ groupId: 'asc' }, { userId: 'asc' }, { startsAt: 'asc' }],
    }),
    prisma.position.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
    prisma.positionScope.findMany({ orderBy: [{ positionId: 'asc' }, { groupId: 'asc' }] }),
    prisma.positionAssignment.findMany({ orderBy: [{ positionId: 'asc' }, { startsAt: 'asc' }] }),
  ])
  return buildOrganizationOverviewState({
    groups,
    members: users,
    memberships,
    positions,
    scopes,
    assignments,
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
  at,
}: {
  groups: Group[]
  members: User[]
  memberships: GroupMembership[]
  positions: Position[]
  scopes: PositionScope[]
  assignments: PositionAssignment[]
  at: Date
}): OrganizationOverviewState {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const groupPathLabels = buildGroupPathLabels(groups)
  const membersById = new Map(members.map((member) => [member.id, member]))
  const memberLabels = new Map(buildUserLabels(members).map((memberLabel) => [memberLabel.user.id, memberLabel]))
  const positionScopesByPositionId = groupPositionScopes({ groups, scopes })
  const positionScopeLabels = buildPositionScopeLabels({ groups, positions, positionScopesByPositionId })

  const membershipPeriods = memberships
    .flatMap((membership): OverviewGroupMembershipPeriod[] => {
      const group = groupsById.get(membership.groupId)
      const groupPath = group ? groupPathLabels.get(group.id) : undefined
      return group && groupPath ? [{ ...membership, group, groupPath }] : []
    })
    .sort(compareGroupMembershipPeriods)

  const assignmentPeriods = assignments
    .flatMap((assignment): OverviewPositionAssignmentPeriod[] => {
      const position = positions.find((candidate) => candidate.id === assignment.positionId)
      const member = membersById.get(assignment.userId)
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
    groupHierarchy: buildGroupTree(groups),
    memberViews: members.map((member) => {
      const memberLabel = memberLabels.get(member.id) ?? { label: formatUserFallbackLabel(member), detail: member.id }
      const memberMemberships = membershipPeriods.filter((membership) => membership.userId === member.id)
      const memberAssignments = assignmentPeriods.filter((assignment) => assignment.userId === member.id)
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

function groupPositionScopes({ groups, scopes }: { groups: Group[]; scopes: PositionScope[] }) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const groupPathLabels = buildGroupPathLabels(groups)
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
        groupPath: groupPathLabels.get(group.id) ?? group.name,
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

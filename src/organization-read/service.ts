import type { AccessActor } from '@/admin/access-policy'
import type {
  AuthUserIdentity,
  GroupMembershipHistory,
  GroupStructure,
  MemberRegistry,
  OrganizationRecord,
  PositionAssignmentHistory,
  PositionScopeRegistry,
} from '@/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/organization/dated-history'
import { formatGroupPath } from '@/organization/group-labels'
import { buildMemberLabels, formatMemberFallbackLabel } from '@/organization/member-labels'
import { formatPositionScopeLabel, noGroupScopesLabel } from '@/organization/position-labels'

export type OrganizationalReadOnlyActor = AccessActor

export type ReadOnlyGroupHierarchyNode = {
  group: OrganizationRecord<'group'>
  depth: number
  children: ReadOnlyGroupHierarchyNode[]
}

export type ReadOnlyGroupMembershipPeriod = OrganizationRecord<'groupMembership'> & {
  group: OrganizationRecord<'group'>
  groupPath: string
}

export type ReadOnlyPositionScope = OrganizationRecord<'positionScope'> & {
  group: OrganizationRecord<'group'>
  groupPath: string
}

export type ReadOnlyPositionAssignmentPeriod = OrganizationRecord<'positionAssignment'> & {
  position: OrganizationRecord<'position'>
  member: OrganizationRecord<'member'>
  positionLabel: string
  positionScopeLabel: string
  memberLabel: string
  memberDetail: string
}

export type ReadOnlyMemberView = {
  member: OrganizationRecord<'member'>
  memberLabel: string
  memberDetail: string
  currentMemberships: ReadOnlyGroupMembershipPeriod[]
  historicalMemberships: ReadOnlyGroupMembershipPeriod[]
  currentAssignments: ReadOnlyPositionAssignmentPeriod[]
  historicalAssignments: ReadOnlyPositionAssignmentPeriod[]
}

export type ReadOnlyPositionView = {
  position: OrganizationRecord<'position'>
  scopes: ReadOnlyPositionScope[]
  scopeLabel: string
  currentAssignments: ReadOnlyPositionAssignmentPeriod[]
  historicalAssignments: ReadOnlyPositionAssignmentPeriod[]
}

export type OrganizationalReadOnlyState = {
  groups: OrganizationRecord<'group'>[]
  groupHierarchy: ReadOnlyGroupHierarchyNode[]
  memberViews: ReadOnlyMemberView[]
  positionViews: ReadOnlyPositionView[]
}

export type OrganizationalReadOnlyService = {
  listOrganizationalReadOnly(
    actor: OrganizationalReadOnlyActor | null | undefined,
    input?: { at?: Date },
  ): Promise<OrganizationalReadOnlyState>
}

export class OrganizationalReadOnlyAuthorizationError extends Error {
  constructor() {
    super('Sign in to view the organization.')
    this.name = 'OrganizationalReadOnlyAuthorizationError'
  }
}

export function createOrganizationalReadOnlyService({
  authGateway,
  groupMembershipHistory,
  groupStructure,
  memberRegistry,
  positionAssignmentHistory,
  positionScopeRegistry,
}: {
  authGateway?: { listUsers(): Promise<AuthUserIdentity[]> }
  groupMembershipHistory: GroupMembershipHistory
  groupStructure: GroupStructure
  memberRegistry: MemberRegistry
  positionAssignmentHistory: PositionAssignmentHistory
  positionScopeRegistry: PositionScopeRegistry
}): OrganizationalReadOnlyService {
  return {
    async listOrganizationalReadOnly(actor, input) {
      assertAuthenticated(actor)
      const [groups, members, memberships, positions, scopes, assignments, users] = await Promise.all([
        groupStructure.listGroups(),
        memberRegistry.listMembers(),
        groupMembershipHistory.listGroupMemberships(),
        positionScopeRegistry.listPositions(),
        positionScopeRegistry.listPositionScopes(),
        positionAssignmentHistory.listPositionAssignments(),
        authGateway?.listUsers() ?? Promise.resolve([]),
      ])

      return buildOrganizationalReadOnlyState({
        groups,
        members,
        memberships,
        positions,
        scopes,
        assignments,
        users,
        at: input?.at ?? new Date(),
      })
    },
  }
}

export function buildOrganizationalReadOnlyState({
  groups,
  members,
  memberships,
  positions,
  scopes,
  assignments,
  users = [],
  at,
}: {
  groups: OrganizationRecord<'group'>[]
  members: OrganizationRecord<'member'>[]
  memberships: OrganizationRecord<'groupMembership'>[]
  positions: OrganizationRecord<'position'>[]
  scopes: OrganizationRecord<'positionScope'>[]
  assignments: OrganizationRecord<'positionAssignment'>[]
  users?: AuthUserIdentity[]
  at: Date
}): OrganizationalReadOnlyState {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const memberLabels = new Map(
    buildMemberLabels(members, users).map((memberLabel) => [memberLabel.member.id, memberLabel]),
  )
  const positionScopesByPositionId = groupPositionScopes({ groups, scopes })
  const positionScopeLabels = buildPositionScopeLabels({ groups, positions, positionScopesByPositionId })

  const membershipPeriods = memberships
    .flatMap((membership): ReadOnlyGroupMembershipPeriod[] => {
      const group = groupsById.get(membership.groupId)
      return group ? [{ ...membership, group, groupPath: formatGroupPath(groups, group) }] : []
    })
    .sort(compareGroupMembershipPeriods)

  const assignmentPeriods = assignments
    .flatMap((assignment): ReadOnlyPositionAssignmentPeriod[] => {
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
    groupHierarchy: buildReadOnlyGroupHierarchy(groups),
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

export function buildReadOnlyGroupHierarchy(groups: OrganizationRecord<'group'>[]): ReadOnlyGroupHierarchyNode[] {
  const nodes = new Map<string, ReadOnlyGroupHierarchyNode>()
  const roots: ReadOnlyGroupHierarchyNode[] = []

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

function assignGroupHierarchyDepths(nodes: ReadOnlyGroupHierarchyNode[], depth: number) {
  for (const node of nodes) {
    node.depth = depth
    assignGroupHierarchyDepths(node.children, depth + 1)
  }
}

function sortGroupHierarchy(nodes: ReadOnlyGroupHierarchyNode[]) {
  nodes.sort(compareGroupHierarchyNodes)
  for (const node of nodes) {
    sortGroupHierarchy(node.children)
  }
}

function compareGroupHierarchyNodes(first: ReadOnlyGroupHierarchyNode, second: ReadOnlyGroupHierarchyNode) {
  return first.group.name.localeCompare(second.group.name) || first.group.id.localeCompare(second.group.id)
}

function groupPositionScopes({
  groups,
  scopes,
}: {
  groups: OrganizationRecord<'group'>[]
  scopes: OrganizationRecord<'positionScope'>[]
}) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const scopesByPositionId = new Map<string, ReadOnlyPositionScope[]>()
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
  groups: OrganizationRecord<'group'>[]
  positions: OrganizationRecord<'position'>[]
  positionScopesByPositionId: Map<string, ReadOnlyPositionScope[]>
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

function compareGroupMembershipPeriods(first: ReadOnlyGroupMembershipPeriod, second: ReadOnlyGroupMembershipPeriod) {
  return (
    first.groupPath.localeCompare(second.groupPath) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

function comparePositionAssignmentPeriods(
  first: ReadOnlyPositionAssignmentPeriod,
  second: ReadOnlyPositionAssignmentPeriod,
) {
  return (
    first.positionLabel.localeCompare(second.positionLabel) ||
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

function assertAuthenticated(actor: OrganizationalReadOnlyActor | null | undefined) {
  if (!actor) {
    throw new OrganizationalReadOnlyAuthorizationError()
  }
}

import 'server-only'

import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildMemberLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

async function listCollection(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, positions, scopes, assignments, members, identities] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ at }),
    organizationService.members.list(),
    organizationService.members.listIdentities(),
  ])
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const memberLabels = new Map(buildMemberLabels(members, identities).map((option) => [option.member.id, option.label]))

  return positions
    .map((position) => {
      const scopeGroups = scopes
        .filter((scope) => scope.positionId === position.id)
        .flatMap((scope) => {
          const group = groupsById.get(scope.groupId)
          return group ? [group] : []
        })
        .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
      const currentAssignment = assignments.find(
        (assignment) => assignment.positionId === position.id && isCurrentDatedPeriod(assignment, at),
      )
      return {
        id: position.id,
        name: position.name,
        scopeLabel: formatPositionScopeLabel(groups, scopeGroups),
        currentHolder: currentAssignment ? (memberLabels.get(currentAssignment.memberId) ?? 'Unknown Member') : null,
        heldSince: currentAssignment?.startsAt ?? null,
      }
    })
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name) ||
        first.scopeLabel.localeCompare(second.scopeLabel) ||
        first.id.localeCompare(second.id),
    )
}

// TODO: Wasteful?
async function getDetail(positionId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, positions, scopes, assignments, members, identities] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ positionId }),
    organizationService.members.list(),
    organizationService.members.listIdentities(),
  ])
  const position = positions.find((candidate) => candidate.id === positionId)
  if (!position) return null
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const scopeGroups = scopes
    .filter((scope) => scope.positionId === positionId)
    .flatMap((scope) => {
      const group = groupsById.get(scope.groupId)
      return group ? [group] : []
    })
    .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
  const membersById = new Map(buildMemberLabels(members, identities).map((option) => [option.member.id, option]))
  const assignmentViews = assignments.flatMap((assignment) => {
    const member = membersById.get(assignment.memberId)
    return member ? [{ ...assignment, memberLabel: member.label, memberDetail: member.detail }] : []
  })
  const compareAssignments = (first: (typeof assignmentViews)[number], second: (typeof assignmentViews)[number]) =>
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)

  return {
    position,
    groups,
    scopeGroups,
    scopeLabel: formatPositionScopeLabel(groups, scopeGroups),
    members: [...membersById.values()].sort(
      (first, second) => first.label.localeCompare(second.label) || first.member.id.localeCompare(second.member.id),
    ),
    currentAssignments: assignmentViews
      .filter((assignment) => isCurrentDatedPeriod(assignment, at))
      .sort(compareAssignments),
    historicalAssignments: assignmentViews
      .filter((assignment) => isHistoricalDatedPeriod(assignment, at))
      .sort(
        (first, second) =>
          (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || compareAssignments(first, second),
      ),
  }
}

async function getDetailForCreate() {
  return { groups: await organizationService.groups.list() }
}

export const positionManagementQuery = { listCollection, getDetail, getDetailForCreate }

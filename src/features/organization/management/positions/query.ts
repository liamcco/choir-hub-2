import 'server-only'

import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildUserLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

async function listCollection(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, positions, scopes, assignments, users] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ at }),
    organizationService.users.list(),
  ])
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const memberLabels = new Map(buildUserLabels(users).map((option) => [option.user.id, option.label]))

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
        currentHolder: currentAssignment ? (memberLabels.get(currentAssignment.userId) ?? 'Unknown User') : null,
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
  const [groups, positions, scopes, assignments, users] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ positionId }),
    organizationService.users.list(),
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
  const membersById = new Map(buildUserLabels(users).map((option) => [option.user.id, option]))
  const assignmentViews = assignments.flatMap((assignment) => {
    const member = membersById.get(assignment.userId)
    return member ? [{ ...assignment, userLabel: member.label, userDetail: member.detail }] : []
  })
  const compareAssignments = (first: (typeof assignmentViews)[number], second: (typeof assignmentViews)[number]) =>
    first.userLabel.localeCompare(second.userLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)

  return {
    position,
    groups,
    scopeGroups,
    scopeLabel: formatPositionScopeLabel(groups, scopeGroups),
    users: [...membersById.values()].sort(
      (first, second) => first.label.localeCompare(second.label) || first.user.id.localeCompare(second.user.id),
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

export const listPositionCollection = listCollection
export const getPositionDetail = getDetail
export const getPositionDetailForCreate = getDetailForCreate

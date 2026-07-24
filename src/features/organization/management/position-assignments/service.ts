import type { Group, Position, PositionAssignment, PositionScope, User } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildUserLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

export type PositionAssignmentPeriod = PositionAssignment & {
  position: Position
  user: User
  positionLabel: string
  positionScopeLabel: string
  userLabel: string
  userDetail: string
}

export type PositionAssignmentPositionView = {
  position: Position
  positionLabel: string
  positionScopeLabel: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export type PositionAssignmentUserView = {
  user: User
  userLabel: string
  userDetail: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export async function listPositionAssignmentManagement(input?: { at?: Date }) {
  const [groups, users, positions, scopes, assignments] = await Promise.all([
    organizationService.groups.list(),
    organizationService.users.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list(),
  ])
  return buildPositionAssignmentManagementState({
    groups,
    positions,
    scopes,
    assignments,
    users,
    at: input?.at ?? new Date(),
  })
}

export type PositionAssignmentManagementState = Awaited<ReturnType<typeof listPositionAssignmentManagement>>

export function buildPositionAssignmentManagementState({
  groups,
  positions,
  scopes,
  assignments,
  users,
  at,
}: {
  groups: Group[]
  positions: Position[]
  scopes: PositionScope[]
  assignments: PositionAssignment[]
  users: User[]
  at: Date
}) {
  const positionsById = new Map(positions.map((position) => [position.id, position]))
  const usersById = new Map(users.map((user) => [user.id, user]))
  const positionOptions = buildPositionOptions(groups, positions, scopes)
  const positionOptionsById = new Map(positionOptions.map((option) => [option.position.id, option]))
  const userOptions = buildUserLabels(users)
  const userOptionsById = new Map(userOptions.map((option) => [option.user.id, option]))
  const periods = assignments
    .flatMap((assignment): PositionAssignmentPeriod[] => {
      const position = positionsById.get(assignment.positionId)
      const positionOption = position ? positionOptionsById.get(position.id) : undefined
      const user = usersById.get(assignment.userId)
      const userOption = user ? userOptionsById.get(user.id) : undefined
      return position && positionOption && user && userOption
        ? [
            {
              ...assignment,
              position,
              user,
              positionLabel: positionOption.label,
              positionScopeLabel: positionOption.scopeLabel,
              userLabel: userOption.label,
              userDetail: userOption.detail,
            },
          ]
        : []
    })
    .sort(
      (first, second) =>
        first.positionLabel.localeCompare(second.positionLabel) ||
        first.userLabel.localeCompare(second.userLabel) ||
        first.startsAt.getTime() - second.startsAt.getTime() ||
        first.id.localeCompare(second.id),
    )

  return {
    positions: positionOptions,
    users: userOptions,
    positionViews: positionOptions.map(
      (option): PositionAssignmentPositionView => ({
        position: option.position,
        positionLabel: option.label,
        positionScopeLabel: option.scopeLabel,
        ...partitionAssignments(
          periods.filter((assignment) => assignment.positionId === option.position.id),
          at,
        ),
      }),
    ),
    userViews: userOptions.map(
      (option): PositionAssignmentUserView => ({
        user: option.user,
        userLabel: option.label,
        userDetail: option.detail,
        ...partitionAssignments(
          periods.filter((assignment) => assignment.userId === option.user.id),
          at,
        ),
      }),
    ),
  }
}

function buildPositionOptions(groups: Group[], positions: Position[], scopes: PositionScope[]) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  return positions.map((position) => {
    const scopeGroups = scopes
      .filter((scope) => scope.positionId === position.id)
      .flatMap((scope) => {
        const group = groupsById.get(scope.groupId)
        return group ? [group] : []
      })
      .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
    const scopeLabel = formatPositionScopeLabel(groups, scopeGroups)
    return { position, label: `${position.name} (${scopeLabel})`, scopeLabel }
  })
}

function partitionAssignments(periods: PositionAssignmentPeriod[], at: Date) {
  return {
    currentAssignments: periods.filter((assignment) => isCurrentDatedPeriod(assignment, at)),
    historicalAssignments: periods.filter((assignment) => isHistoricalDatedPeriod(assignment, at)),
  }
}

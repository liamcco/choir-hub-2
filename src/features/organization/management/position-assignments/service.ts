import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildMemberLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'
import type { Group, Member, Position, PositionAssignment, PositionScope } from '@/prisma/generated/client'

export type PositionAssignmentPeriod = PositionAssignment & {
  position: Position
  member: Member
  positionLabel: string
  positionScopeLabel: string
  memberLabel: string
  memberDetail: string
}

export type PositionAssignmentPositionView = {
  position: Position
  positionLabel: string
  positionScopeLabel: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export type PositionAssignmentMemberView = {
  member: Member
  memberLabel: string
  memberDetail: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export async function listPositionAssignmentManagement(input?: { at?: Date }) {
  const [groups, members, positions, scopes, assignments, users] = await Promise.all([
    organizationService.groups.list(),
    organizationService.members.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list(),
    organizationService.members.listIdentities(),
  ])
  return buildPositionAssignmentManagementState({
    groups,
    members,
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
  members,
  positions,
  scopes,
  assignments,
  users = [],
  at,
}: {
  groups: Group[]
  members: Member[]
  positions: Position[]
  scopes: PositionScope[]
  assignments: PositionAssignment[]
  users?: { id: string; name: string; email: string }[]
  at: Date
}) {
  const positionsById = new Map(positions.map((position) => [position.id, position]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const positionOptions = buildPositionOptions(groups, positions, scopes)
  const positionOptionsById = new Map(positionOptions.map((option) => [option.position.id, option]))
  const memberOptions = buildMemberLabels(members, users)
  const memberOptionsById = new Map(memberOptions.map((option) => [option.member.id, option]))
  const periods = assignments
    .flatMap((assignment): PositionAssignmentPeriod[] => {
      const position = positionsById.get(assignment.positionId)
      const positionOption = position ? positionOptionsById.get(position.id) : undefined
      const member = membersById.get(assignment.memberId)
      const memberOption = member ? memberOptionsById.get(member.id) : undefined
      return position && positionOption && member && memberOption
        ? [
            {
              ...assignment,
              position,
              member,
              positionLabel: positionOption.label,
              positionScopeLabel: positionOption.scopeLabel,
              memberLabel: memberOption.label,
              memberDetail: memberOption.detail,
            },
          ]
        : []
    })
    .sort(
      (first, second) =>
        first.positionLabel.localeCompare(second.positionLabel) ||
        first.memberLabel.localeCompare(second.memberLabel) ||
        first.startsAt.getTime() - second.startsAt.getTime() ||
        first.id.localeCompare(second.id),
    )

  return {
    positions: positionOptions,
    members: memberOptions,
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
    memberViews: memberOptions.map(
      (option): PositionAssignmentMemberView => ({
        member: option.member,
        memberLabel: option.label,
        memberDetail: option.detail,
        ...partitionAssignments(
          periods.filter((assignment) => assignment.memberId === option.member.id),
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

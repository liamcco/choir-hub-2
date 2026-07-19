import { type AccessActor, canAccessAdminSurface } from '@/admin/access-policy'
import { formatGroupPath } from '@/admin/group-management/group-labels'
import type { AuthAdminGateway, AuthUserAccount } from '@/admin/member-management/account-lifecycle'
import {
  type GroupStructure,
  type MemberRegistry,
  OrganizationDomainError,
  type OrganizationRecord,
  type PositionAssignmentHistory,
  type PositionScopeRegistry,
} from '@/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/organization/dated-history'
import type { CreatePositionAssignmentInput } from '@/organization/types'

export type PositionAssignmentManagementActor = AccessActor

export type PositionAssignmentPositionOption = {
  position: OrganizationRecord<'position'>
  label: string
  scopeLabel: string
}

export type PositionAssignmentMemberOption = {
  member: OrganizationRecord<'member'>
  label: string
  detail: string
}

export type PositionAssignmentPeriod = OrganizationRecord<'positionAssignment'> & {
  position: OrganizationRecord<'position'>
  member: OrganizationRecord<'member'>
  positionLabel: string
  positionScopeLabel: string
  memberLabel: string
  memberDetail: string
}

export type PositionAssignmentPositionView = {
  position: OrganizationRecord<'position'>
  positionLabel: string
  positionScopeLabel: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export type PositionAssignmentMemberView = {
  member: OrganizationRecord<'member'>
  memberLabel: string
  memberDetail: string
  currentAssignments: PositionAssignmentPeriod[]
  historicalAssignments: PositionAssignmentPeriod[]
}

export type PositionAssignmentManagementState = {
  positions: PositionAssignmentPositionOption[]
  members: PositionAssignmentMemberOption[]
  positionViews: PositionAssignmentPositionView[]
  memberViews: PositionAssignmentMemberView[]
}

export type EndPositionAssignmentInput = {
  endsAt: Date
}

export type PositionAssignmentManagementService = {
  listPositionAssignmentManagement(
    actor: PositionAssignmentManagementActor,
    input?: { at?: Date },
  ): Promise<PositionAssignmentManagementState>
  createPositionAssignment(
    actor: PositionAssignmentManagementActor,
    input: CreatePositionAssignmentInput,
  ): Promise<OrganizationRecord<'positionAssignment'>>
  endPositionAssignment(
    actor: PositionAssignmentManagementActor,
    assignmentId: string,
    input: EndPositionAssignmentInput,
  ): Promise<OrganizationRecord<'positionAssignment'>>
}

export class PositionAssignmentManagementAuthorizationError extends Error {
  constructor() {
    super('Only admins can manage Position Assignments.')
    this.name = 'PositionAssignmentManagementAuthorizationError'
  }
}

export class PositionAssignmentManagementValidationError extends Error {
  readonly fieldErrors: Partial<Record<keyof CreatePositionAssignmentInput | keyof EndPositionAssignmentInput, string>>

  constructor(
    message: string,
    fieldErrors: Partial<Record<keyof CreatePositionAssignmentInput | keyof EndPositionAssignmentInput, string>>,
  ) {
    super(message)
    this.name = 'PositionAssignmentManagementValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function createPositionAssignmentManagementService({
  authGateway,
  groupStructure,
  memberRegistry,
  positionAssignmentHistory,
  positionScopeRegistry,
}: {
  authGateway?: Pick<AuthAdminGateway, 'listUsers'>
  groupStructure: GroupStructure
  memberRegistry: MemberRegistry
  positionAssignmentHistory: PositionAssignmentHistory
  positionScopeRegistry: PositionScopeRegistry
}): PositionAssignmentManagementService {
  return {
    async listPositionAssignmentManagement(actor, input) {
      assertAdmin(actor)
      const [groups, members, positions, scopes, assignments, users] = await Promise.all([
        groupStructure.listGroups(),
        memberRegistry.listMembers(),
        positionScopeRegistry.listPositions(),
        positionScopeRegistry.listPositionScopes(),
        positionAssignmentHistory.listPositionAssignments(),
        authGateway?.listUsers() ?? Promise.resolve([]),
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
    },
    async createPositionAssignment(actor, input) {
      assertAdmin(actor)
      return mapValidationErrors(() => positionAssignmentHistory.createPositionAssignment(input))
    },
    async endPositionAssignment(actor, assignmentId, input) {
      assertAdmin(actor)
      return mapValidationErrors(() =>
        positionAssignmentHistory.updatePositionAssignment(assignmentId, { endsAt: input.endsAt }),
      )
    },
  }
}

export function buildPositionAssignmentManagementState({
  groups,
  members,
  positions,
  scopes,
  assignments,
  users = [],
  at,
}: {
  groups: OrganizationRecord<'group'>[]
  members: OrganizationRecord<'member'>[]
  positions: OrganizationRecord<'position'>[]
  scopes: OrganizationRecord<'positionScope'>[]
  assignments: OrganizationRecord<'positionAssignment'>[]
  users?: Pick<AuthUserAccount, 'id' | 'name' | 'email'>[]
  at: Date
}): PositionAssignmentManagementState {
  const positionsById = new Map(positions.map((position) => [position.id, position]))
  const membersById = new Map(members.map((member) => [member.id, member]))
  const positionOptions = buildPositionOptions({ groups, positions, scopes })
  const positionOptionsById = new Map(positionOptions.map((option) => [option.position.id, option]))
  const memberOptions = buildMemberOptions(members, users)
  const memberOptionsByMemberId = new Map(memberOptions.map((option) => [option.member.id, option]))
  const periods = assignments
    .flatMap((assignment): PositionAssignmentPeriod[] => {
      const position = positionsById.get(assignment.positionId)
      const positionOption = position ? positionOptionsById.get(position.id) : undefined
      const member = membersById.get(assignment.memberId)
      const memberOption = member ? memberOptionsByMemberId.get(member.id) : undefined
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
    .sort(compareAssignmentPeriods)

  return {
    positions: positionOptions,
    members: memberOptions,
    positionViews: positionOptions.map((option) => {
      const positionPeriods = periods.filter((assignment) => assignment.positionId === option.position.id)
      return {
        position: option.position,
        positionLabel: option.label,
        positionScopeLabel: option.scopeLabel,
        ...partitionAssignmentPeriods(positionPeriods, at),
      }
    }),
    memberViews: memberOptions.map((option) => {
      const memberPeriods = periods.filter((assignment) => assignment.memberId === option.member.id)
      return {
        member: option.member,
        memberLabel: option.label,
        memberDetail: option.detail,
        ...partitionAssignmentPeriods(memberPeriods, at),
      }
    }),
  }
}

function buildPositionOptions({
  groups,
  positions,
  scopes,
}: {
  groups: OrganizationRecord<'group'>[]
  positions: OrganizationRecord<'position'>[]
  scopes: OrganizationRecord<'positionScope'>[]
}): PositionAssignmentPositionOption[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  return positions.map((position) => {
    const scopeGroups = scopes
      .filter((scope) => scope.positionId === position.id)
      .flatMap((scope) => {
        const group = groupsById.get(scope.groupId)
        return group ? [group] : []
      })
      .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
    const scopeLabel = formatScopeLabel(groups, scopeGroups)

    return {
      position,
      label: `${position.name} (${scopeLabel})`,
      scopeLabel,
    }
  })
}

function formatScopeLabel(groups: OrganizationRecord<'group'>[], scopeGroups: OrganizationRecord<'group'>[]) {
  if (scopeGroups.length === 0) {
    return 'No Group scopes'
  }
  return scopeGroups.map((group) => formatGroupPath(groups, group)).join(' + ')
}

function compareAssignmentPeriods(first: PositionAssignmentPeriod, second: PositionAssignmentPeriod) {
  return (
    first.positionLabel.localeCompare(second.positionLabel) ||
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

function partitionAssignmentPeriods(periods: PositionAssignmentPeriod[], at: Date) {
  return {
    currentAssignments: periods.filter((assignment) => isCurrentDatedPeriod(assignment, at)),
    historicalAssignments: periods.filter((assignment) => isHistoricalDatedPeriod(assignment, at)),
  }
}

export function formatMemberFallbackLabel(member: OrganizationRecord<'member'>) {
  return `Member ${member.id}`
}

function buildMemberOptions(
  members: OrganizationRecord<'member'>[],
  users: Pick<AuthUserAccount, 'id' | 'name' | 'email'>[],
): PositionAssignmentMemberOption[] {
  const usersById = new Map(users.map((user) => [user.id, user]))
  return members.map((member) => {
    const user = usersById.get(member.userId)
    return {
      member,
      label: user?.name || formatMemberFallbackLabel(member),
      detail: user?.email ?? member.id,
    }
  })
}

async function mapValidationErrors<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof OrganizationDomainError) {
      throw new PositionAssignmentManagementValidationError(error.message, {
        [error.field ?? 'startsAt']: error.message,
      })
    }
    throw error
  }
}

function assertAdmin(actor: PositionAssignmentManagementActor | null | undefined) {
  if (!canAccessAdminSurface(actor)) {
    throw new PositionAssignmentManagementAuthorizationError()
  }
}

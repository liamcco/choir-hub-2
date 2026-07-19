import { formatGroupPath } from '@/admin/group-management/group-labels'
import type { AccessActor } from '@/lib/access-actor'
import { canAccessAdminSurface } from '@/lib/route-access'
import {
  formatPositionScopeLabel,
  type GroupStructure,
  OrganizationDomainError,
  type OrganizationRecord,
  type PositionScopeRegistry,
} from '@/organization'
import type { CreatePositionInput, UpdatePositionInput } from '@/organization/types'

export type PositionManagementActor = AccessActor

export type PositionScopeKind = 'single' | 'shared' | 'unscoped'

export type PositionManagementPosition = {
  position: OrganizationRecord<'position'>
  scopeGroups: OrganizationRecord<'group'>[]
  scopeLabel: string
  scopeKind: PositionScopeKind
  duplicateNameCount: number
}

export type PositionManagementState = {
  groups: OrganizationRecord<'group'>[]
  positions: PositionManagementPosition[]
}

export type PositionManagementInput = CreatePositionInput & {
  groupIds: string[]
}

export type PositionManagementUpdateInput = UpdatePositionInput & {
  groupIds?: string[]
}

export type PositionManagementService = {
  listPositionManagement(actor: PositionManagementActor): Promise<PositionManagementState>
  createPosition(
    actor: PositionManagementActor,
    input: PositionManagementInput,
  ): Promise<OrganizationRecord<'position'>>
  updatePosition(
    actor: PositionManagementActor,
    positionId: string,
    input: PositionManagementUpdateInput,
  ): Promise<OrganizationRecord<'position'>>
}

export class PositionManagementAuthorizationError extends Error {
  constructor() {
    super('Only admins can manage Positions.')
    this.name = 'PositionManagementAuthorizationError'
  }
}

export class PositionManagementValidationError extends Error {
  readonly fieldErrors: Partial<Record<keyof PositionManagementInput, string>>

  constructor(message: string, fieldErrors: Partial<Record<keyof PositionManagementInput, string>>) {
    super(message)
    this.name = 'PositionManagementValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function createPositionManagementService({
  groupStructure,
  positionScopeRegistry,
}: {
  groupStructure: GroupStructure
  positionScopeRegistry: PositionScopeRegistry
}): PositionManagementService {
  return {
    async listPositionManagement(actor) {
      assertAdmin(actor)
      const [groups, positions, scopes] = await Promise.all([
        groupStructure.listGroups(),
        positionScopeRegistry.listPositions(),
        positionScopeRegistry.listPositionScopes(),
      ])
      return buildPositionManagementState({ groups, positions, scopes })
    },
    async createPosition(actor, input) {
      assertAdmin(actor)
      const groupIds = await normalizeGroupIds(groupStructure, input.groupIds)
      return mapValidationErrors(async () => {
        const position = await positionScopeRegistry.createPosition(input)
        for (const groupId of groupIds) {
          await positionScopeRegistry.createPositionScope({ positionId: position.id, groupId })
        }
        return position
      })
    },
    async updatePosition(actor, positionId, input) {
      assertAdmin(actor)
      const { groupIds: rawGroupIds, ...positionInput } = input
      const groupIds = rawGroupIds ? await normalizeGroupIds(groupStructure, rawGroupIds) : undefined
      return mapValidationErrors(async () => {
        const position = await positionScopeRegistry.updatePosition(positionId, positionInput)
        if (groupIds) {
          await reconcilePositionScopes(positionScopeRegistry, positionId, groupIds)
        }
        return position
      })
    },
  }
}

export function buildPositionManagementState({
  groups,
  positions,
  scopes,
}: {
  groups: OrganizationRecord<'group'>[]
  positions: OrganizationRecord<'position'>[]
  scopes: OrganizationRecord<'positionScope'>[]
}): PositionManagementState {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const nameCounts = countNormalizedNames(positions)

  return {
    groups,
    positions: positions.map((position) => {
      const scopeGroups = scopes
        .filter((scope) => scope.positionId === position.id)
        .flatMap((scope) => {
          const group = groupsById.get(scope.groupId)
          return group ? [group] : []
        })
        .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))

      return {
        position,
        scopeGroups,
        scopeLabel: formatPositionScopeLabel(groups, scopeGroups),
        scopeKind: scopeGroups.length > 1 ? 'shared' : scopeGroups.length === 1 ? 'single' : 'unscoped',
        duplicateNameCount: nameCounts.get(normalizeNameKey(position.name)) ?? 1,
      }
    }),
  }
}

async function normalizeGroupIds(groupStructure: GroupStructure, groupIds: string[]) {
  const uniqueGroupIds = [...new Set(groupIds.map((groupId) => groupId.trim()).filter(Boolean))]
  if (uniqueGroupIds.length === 0) {
    throw new PositionManagementValidationError('Choose at least one Group.', {
      groupIds: 'Choose at least one Group.',
    })
  }

  const knownGroupIds = new Set((await groupStructure.listGroups()).map((group) => group.id))
  const missingGroupId = uniqueGroupIds.find((groupId) => !knownGroupIds.has(groupId))
  if (missingGroupId) {
    throw new PositionManagementValidationError('Choose an existing Group.', {
      groupIds: `Unknown Group: ${missingGroupId}`,
    })
  }

  return uniqueGroupIds
}

async function reconcilePositionScopes(
  positionScopeRegistry: PositionScopeRegistry,
  positionId: string,
  groupIds: string[],
) {
  const currentScopes = (await positionScopeRegistry.listPositionScopes()).filter(
    (scope) => scope.positionId === positionId,
  )
  const currentGroupIds = new Set(currentScopes.map((scope) => scope.groupId))
  const desiredGroupIds = new Set(groupIds)

  for (const groupId of groupIds) {
    if (!currentGroupIds.has(groupId)) {
      await positionScopeRegistry.createPositionScope({ positionId, groupId })
    }
  }
  for (const scope of currentScopes) {
    if (!desiredGroupIds.has(scope.groupId)) {
      await positionScopeRegistry.deletePositionScope({ positionId, groupId: scope.groupId })
    }
  }
}

function countNormalizedNames(positions: OrganizationRecord<'position'>[]) {
  const counts = new Map<string, number>()
  for (const position of positions) {
    const key = normalizeNameKey(position.name)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function normalizeNameKey(value: string) {
  return value.trim().toLocaleLowerCase()
}

async function mapValidationErrors<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof OrganizationDomainError) {
      throw new PositionManagementValidationError(error.message, {
        [error.field ?? 'name']: error.message,
      })
    }
    throw error
  }
}

function assertAdmin(actor: PositionManagementActor | null | undefined) {
  if (!canAccessAdminSurface(actor)) {
    throw new PositionManagementAuthorizationError()
  }
}

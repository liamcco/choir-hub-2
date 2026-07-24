import type { Group, Position, PositionScope } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

export type PositionManagementPosition = {
  position: Position
  scopeGroups: Group[]
  scopeLabel: string
  scopeKind: 'single' | 'shared' | 'unscoped'
  duplicateNameCount: number
}

export async function listPositionManagement() {
  const [groups, positions, scopes] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
  ])
  return buildPositionManagementState({ groups, positions, scopes })
}

export type PositionManagementState = Awaited<ReturnType<typeof listPositionManagement>>

export function buildPositionManagementState({
  groups,
  positions,
  scopes,
}: {
  groups: Group[]
  positions: Position[]
  scopes: PositionScope[]
}) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  const duplicateNameCounts = new Map<string, number>()
  for (const position of positions) {
    const key = normalizeName(position.name)
    duplicateNameCounts.set(key, (duplicateNameCounts.get(key) ?? 0) + 1)
  }

  return {
    groups,
    positions: positions.map((position): PositionManagementPosition => {
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
        duplicateNameCount: duplicateNameCounts.get(normalizeName(position.name)) ?? 1,
      }
    }),
  }
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

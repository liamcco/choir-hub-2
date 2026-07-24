import type { Choir, Group, Position, PositionScope, Section } from '@/drizzle/schema'
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
  const [groups, choirs, sections, positions, scopes] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.listChoirs(),
    organizationService.positions.listSections(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
  ])
  return buildPositionManagementState({ groups, choirs, sections, positions, scopes })
}

export type PositionManagementState = Awaited<ReturnType<typeof listPositionManagement>>

export function buildPositionManagementState({
  groups,
  choirs,
  sections,
  positions,
  scopes,
}: {
  groups: Group[]
  choirs: Choir[]
  sections: Section[]
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
          const group = scope.groupId ? groupsById.get(scope.groupId) : undefined
          return group ? [group] : []
        })
        .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))

      return {
        position,
        scopeGroups,
        scopeLabel: formatPositionScopeLabel(scopes.filter((scope) => scope.positionId === position.id) as never, {
          choirs,
          sections,
          groups,
        }),
        scopeKind: scopeGroups.length > 1 ? 'shared' : scopeGroups.length === 1 ? 'single' : 'unscoped',
        duplicateNameCount: duplicateNameCounts.get(normalizeName(position.name)) ?? 1,
      }
    }),
  }
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

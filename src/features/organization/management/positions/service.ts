import {
  type Group,
  getGroup,
  listChoirs,
  listGroups,
  listPositions,
  listSections,
  type Position,
} from '@/core/topology'
import { formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

export type PositionManagementPosition = {
  position: Position
  scopeGroups: Group[]
  scopeLabel: string
  scopeKind: 'single' | 'shared' | 'unscoped'
  duplicateNameCount: number
}

export async function listPositionManagement() {
  return buildPositionManagementState({
    groups: listGroups(),
    choirs: listChoirs(),
    sections: listSections(),
    positions: listPositions(),
  })
}

export type PositionManagementState = Awaited<ReturnType<typeof listPositionManagement>>

export function buildPositionManagementState({
  groups,
  choirs,
  sections,
  positions,
}: {
  groups: readonly Group[]
  choirs: ReturnType<typeof listChoirs>
  sections: ReturnType<typeof listSections>
  positions: readonly Position[]
}) {
  const duplicateNameCounts = new Map<string, number>()
  for (const position of positions) {
    const key = normalizeName(position.name)
    duplicateNameCounts.set(key, (duplicateNameCounts.get(key) ?? 0) + 1)
  }

  return {
    groups,
    positions: positions.map((position): PositionManagementPosition => {
      const scopeGroups = position.scopes
        .filter((scope) => scope.type === 'group')
        .flatMap((scope) => {
          const group = getGroup(scope.groupId)
          return group ? [group] : []
        })
        .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
      const scopeLabel = formatPositionScopeLabel(position.scopes, { choirs, sections, groups })

      return {
        position,
        scopeGroups,
        scopeLabel,
        scopeKind: scopeGroups.length > 1 ? 'shared' : scopeGroups.length === 1 ? 'single' : 'unscoped',
        duplicateNameCount: duplicateNameCounts.get(normalizeName(position.name)) ?? 1,
      }
    }),
  }
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

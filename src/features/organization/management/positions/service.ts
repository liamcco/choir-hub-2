/** Focused Position collection reads and pure collection descriptions. */
import { type Group, getGroup, listGroups, listPositions, type Position, TopologyScopeType } from '@/core/topology'
import { formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

export type PositionDescription = {
  position: Position
  scopeGroups: Group[]
  scopeLabel: string
  scopeKind: 'single' | 'shared' | 'unscoped'
  duplicateNameCount: number
}

/** Reads active Positions with the metadata required by the Position collection. */
export function listPositionDescriptions(): PositionDescription[] {
  return describePositions(listPositions(), listGroups())
}

/** Describes Positions for presentation without mutating the canonical topology. */
export function describePositions(positions: readonly Position[], groups: readonly Group[]): PositionDescription[] {
  const duplicateNameCounts = new Map<string, number>()
  for (const position of positions) {
    const key = normalizeName(position.name)
    duplicateNameCounts.set(key, (duplicateNameCounts.get(key) ?? 0) + 1)
  }

  return positions.map((position) => {
    const scopeGroups = position.scopes
      .filter((scope) => scope.type === TopologyScopeType.GROUP)
      .flatMap((scope) => {
        const group = getGroup(scope.groupId)
        if (!group) throw new Error(`Invalid Position ${position.id}: unknown Group ${scope.groupId}.`)
        return [group]
      })
      .sort((first, second) => formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)))
    const scopeLabel = formatPositionScopeLabel(position.scopes)

    return {
      position,
      scopeGroups,
      scopeLabel,
      scopeKind: scopeGroups.length > 1 ? 'shared' : scopeGroups.length === 1 ? 'single' : 'unscoped',
      duplicateNameCount: duplicateNameCounts.get(normalizeName(position.name)) ?? 1,
    }
  })
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

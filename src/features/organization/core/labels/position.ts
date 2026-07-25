import type { Choir, Group, Section } from '@/core/topology'

export type PositionScopeView =
  | { type: 'csk' }
  | { type: 'choir'; choirId: string }
  | { type: 'section'; sectionId: string }
  | { type: 'group'; groupId: string }

export function formatPositionScopeLabel(
  scopes: readonly PositionScopeView[],
  references: { choirs: readonly Choir[]; sections: readonly Section[]; groups: readonly Group[] },
) {
  const choirById = new Map<string, Choir>(references.choirs.map((choir) => [choir.id, choir]))
  const sectionById = new Map<string, Section>(references.sections.map((section) => [section.id, section]))
  const groupById = new Map<string, Group>(references.groups.map((group) => [group.id, group]))
  return scopes
    .map((scope) => {
      if (scope.type === 'csk') return 'CSK'
      if (scope.type === 'choir') return choirById.get(scope.choirId)?.shortName ?? scope.choirId
      if (scope.type === 'section') {
        const section = sectionById.get(scope.sectionId)
        const choir = section ? choirById.get(section.choirId) : undefined
        return section && choir ? formatSectionName(choir.shortName, section.name) : scope.sectionId
      }
      return groupById.get(scope.groupId)?.name ?? scope.groupId
    })
    .sort((a, b) => a.localeCompare(b))
    .join(' · ')
}

export function formatPositionLabel(positionName: string, scopeLabel: string) {
  return scopeLabel ? `${positionName} · ${scopeLabel}` : positionName
}

export function formatSectionName(choirShortName: string, sectionName: string) {
  return `${choirShortName}${sectionName}`
}

export function formatFineGrainedPlacementName(choirShortName: string, voiceType: string) {
  return `${choirShortName}${voiceType}`
}

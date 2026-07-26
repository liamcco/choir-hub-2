import { getChoir, getGroup, getSection, type PositionScope, TopologyScopeType } from '@/core/topology'

/**
 * Formats permanent Position Scopes using the canonical topology definitions.
 * Unknown references are shown as explicit invalid-reference labels rather than omitted.
 */
export function formatPositionScopeLabel(scopes: readonly PositionScope[]) {
  return scopes
    .map((scope) => {
      if (scope.type === TopologyScopeType.CSK) return 'CSK'
      if (scope.type === TopologyScopeType.CHOIR)
        return getChoir(scope.choirId)?.shortName ?? `[Invalid Choir: ${scope.choirId}]`
      if (scope.type === TopologyScopeType.SECTION) {
        const section = getSection(scope.sectionId)
        const choir = section ? getChoir(section.choirId) : undefined
        return section && choir
          ? formatSectionName(choir.shortName, section.name)
          : `[Invalid Section: ${scope.sectionId}]`
      }
      return getGroup(scope.groupId)?.name ?? `[Invalid Group: ${scope.groupId}]`
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

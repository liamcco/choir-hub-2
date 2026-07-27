import { type Choir, type Group, type PositionScope, type Section, TOPOLOGY_SCOPE_TYPES } from '@/core/topology'

export function getPositionCollectionGroup(
  positionScopes: readonly PositionScope[],
  groups: readonly Group[],
  choirs: readonly Choir[],
  sections: readonly Section[],
) {
  const boardGroupIds = new Set<string>(groups.filter((group) => group.kind === 'board').map((group) => group.id))
  if (positionScopes.some((scope) => scope.type === TOPOLOGY_SCOPE_TYPES.GROUP && boardGroupIds.has(scope.groupId)))
    return 'Board'
  const choirById = new Map<string, string>(choirs.map((choir) => [choir.id, choir.shortName]))
  const sectionToChoirId = new Map<string, string>(sections.map((section) => [section.id, section.choirId]))
  const choirShortName = positionScopes
    .map((scope) =>
      scope.type === TOPOLOGY_SCOPE_TYPES.CHOIR
        ? scope.choirId
        : scope.type === TOPOLOGY_SCOPE_TYPES.SECTION
          ? sectionToChoirId.get(scope.sectionId)
          : undefined,
    )
    .map((choirId) => (choirId ? choirById.get(choirId) : undefined))
    .find((shortName) => shortName)
  return choirShortName ?? 'Other'
}

import type { Choir, Group, Section } from '@/core/topology'
import type { PositionScopeView } from '@/features/organization/core/labels/position'

export function getPositionCollectionGroup(
  positionScopes: readonly PositionScopeView[],
  groups: readonly Group[],
  choirs: readonly Choir[],
  sections: readonly Section[],
) {
  const boardGroupIds = new Set<string>(groups.filter((group) => group.kind === 'board').map((group) => group.id))
  if (positionScopes.some((scope) => scope.type === 'group' && boardGroupIds.has(scope.groupId))) return 'Board'
  const choirById = new Map<string, string>(choirs.map((choir) => [choir.id, choir.shortName]))
  const sectionToChoirId = new Map<string, string>(sections.map((section) => [section.id, section.choirId]))
  const choirShortName = positionScopes
    .map((scope) =>
      scope.type === 'choir'
        ? scope.choirId
        : scope.type === 'section'
          ? sectionToChoirId.get(scope.sectionId)
          : undefined,
    )
    .map((choirId) => (choirId ? choirById.get(choirId) : undefined))
    .find((shortName) => shortName)
  return choirShortName ?? 'Other'
}

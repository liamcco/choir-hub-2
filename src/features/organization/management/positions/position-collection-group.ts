export function getPositionCollectionGroup(
  positionScopes: Array<{
    targetType: string
    choirId: string | null
    sectionId: string | null
    groupId: string | null
  }>,
  groups: Array<{ id: string; kind: string }>,
  choirs: Array<{ id: string; shortName: string }>,
  sections: Array<{ id: string; choirId: string }>,
) {
  const boardGroupIds = new Set(
    groups.filter((group) => group.kind === 'board' || group.id === 'board').map((group) => group.id),
  )
  if (positionScopes.some((scope) => scope.groupId && boardGroupIds.has(scope.groupId))) return 'Board'
  const choirById = new Map(choirs.map((choir) => [choir.id, choir.shortName]))
  const sectionToChoirId = new Map(sections.map((section) => [section.id, section.choirId]))
  const choirShortName = positionScopes
    .map((scope) => scope.choirId ?? (scope.sectionId ? sectionToChoirId.get(scope.sectionId) : undefined))
    .map((choirId) => (choirId ? choirById.get(choirId) : undefined))
    .find((shortName) => shortName)
  return choirShortName ?? 'Other'
}

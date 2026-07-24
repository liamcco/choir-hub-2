import type { Choir, Group, Section } from '@/drizzle/schema'

export type PositionScopeView =
  | { targetType: 'csk'; targetKey: 'csk' }
  | { targetType: 'choir'; targetKey: string; choirId: string }
  | { targetType: 'section'; targetKey: string; sectionId: string }
  | { targetType: 'group'; targetKey: string; groupId: string }

export function formatPositionScopeLabel(
  scopes: PositionScopeView[] | Group[],
  references: { choirs: Choir[]; sections: Section[]; groups: Group[] } | Group[],
) {
  if (Array.isArray(references))
    return scopes.length
      ? (scopes as Group[])
          .map((group) => group.name)
          .sort()
          .join(' · ')
      : 'No scopes'
  const typedScopes = scopes as PositionScopeView[]
  const choirById = new Map(references.choirs.map((choir) => [choir.id, choir]))
  const sectionById = new Map(references.sections.map((section) => [section.id, section]))
  const groupById = new Map(references.groups.map((group) => [group.id, group]))
  return typedScopes
    .map((scope) => {
      if (scope.targetType === 'csk') return 'CSK'
      if (scope.targetType === 'choir') return choirById.get(scope.choirId)?.name ?? scope.targetKey
      if (scope.targetType === 'section') {
        const section = sectionById.get(scope.sectionId)
        const choir = section ? choirById.get(section.choirId) : undefined
        return section && choir ? `${choir.shortName} ${section.name}` : scope.targetKey
      }
      return groupById.get(scope.groupId)?.name ?? scope.targetKey
    })
    .sort((a, b) => a.localeCompare(b))
    .join(' · ')
}

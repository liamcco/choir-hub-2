import type { db } from '@/core/db'
import { choir, group, position, positionScope, section } from '@/drizzle/schema'
import { DuplicateEntityError, InvalidRelationshipError } from './errors'

import { referenceCatalogData } from './reference-catalog-data'

export const choirCatalog = referenceCatalogData.choirs.map(({ sections: _sections, ...choir }) => choir)

export type SectionVoiceType = Extract<
  (typeof referenceCatalogData.choirs)[number]['sections'][number],
  { voiceType: string }
>['voiceType']

export const sectionCatalog = referenceCatalogData.choirs.flatMap((choir) =>
  choir.sections.map((sectionDefinition) => {
    const name = typeof sectionDefinition === 'string' ? sectionDefinition : sectionDefinition.name
    const voiceType = typeof sectionDefinition === 'string' ? sectionDefinition : sectionDefinition.voiceType
    const allowedVoiceTypes =
      typeof sectionDefinition === 'string' ? [sectionDefinition] : sectionDefinition.allowedVoiceTypes
    return {
      id: `${choir.id}-${name.toLowerCase()}`,
      choirId: choir.id,
      name,
      voiceType,
      allowedVoiceTypes,
    }
  }),
)

export type CatalogGroup = {
  id: string
  kind: 'committee' | 'board'
  name: string
  scope: { type: 'csk' } | { type: 'choir'; choirId: string }
}

export const groupCatalog: readonly CatalogGroup[] = [
  ...referenceCatalogData.groups.csk.map((group) => ({ ...group, scope: { type: 'csk' as const } })),
  ...choirCatalog.flatMap((choir) =>
    referenceCatalogData.groups.perChoir.map((group) => ({
      id: `${choir.id}-${group.id}`,
      kind: 'committee' as const,
      name: group.name,
      scope: { type: 'choir' as const, choirId: choir.id },
    })),
  ),
]

export type PositionDefinition = { id: string; name: string; scopes: PositionScopeDefinition[] }
export type PositionScopeDefinition =
  | { type: 'csk' }
  | { type: 'choir'; choirId: string }
  | { type: 'section'; sectionId: string }
  | { type: 'group'; groupId: string }

export const positionCatalog: readonly PositionDefinition[] = [
  ...referenceCatalogData.positions.board.map(({ id, name, additionalGroupIds }) => ({
    id,
    name,
    scopes: [
      { type: 'group' as const, groupId: 'board' },
      ...additionalGroupIds.map((groupId) => ({ type: 'group' as const, groupId })),
    ],
  })),
  ...choirCatalog.flatMap((choir) =>
    referenceCatalogData.positions.perChoir.map(({ id: kind, name, additionalGroupIds }) => ({
      id: `${choir.id}-${kind}`,
      name,
      scopes: [
        { type: 'choir' as const, choirId: choir.id },
        ...additionalGroupIds.map((groupId) => ({ type: 'group' as const, groupId })),
      ],
    })),
  ),
  ...referenceCatalogData.positions.csk.map((definition) => ({
    id: definition.id,
    name: definition.name,
    scopes:
      'scope' in definition
        ? ([{ type: definition.scope }] as const)
        : definition.groupIds.map((groupId) => ({ type: 'group' as const, groupId })),
  })),
  ...referenceCatalogData.positions.voiceParents.individualSections.flatMap(({ choirId, voiceTypes }) =>
    voiceTypes.map((voiceType) => ({
      id: `${choirId}-${voiceType.toLowerCase()}-voice-parent`,
      name: 'Voice Parent',
      scopes: [{ type: 'section' as const, sectionId: `${choirId}-${voiceType.toLowerCase()}` }],
    })),
  ),
  ...referenceCatalogData.positions.voiceParents.kammarkorenFamilies.map(({ id }) => ({
    id: `kk-${id}-voice-parent`,
    name: 'Voice Parent',
    scopes: [{ type: 'section' as const, sectionId: `kk-${id}` }],
  })),
]

export type ReferenceCatalog = {
  choirs: typeof choirCatalog
  sections: typeof sectionCatalog
  groups: readonly CatalogGroup[]
  positions: readonly PositionDefinition[]
}

export const referenceCatalog: ReferenceCatalog = {
  choirs: choirCatalog,
  sections: sectionCatalog,
  groups: groupCatalog,
  positions: positionCatalog,
}

export function validateReferenceCatalog(catalog: ReferenceCatalog = referenceCatalog): ReferenceCatalog {
  const ids = new Set<string>()
  const addId = (id: string) => {
    if (ids.has(id)) throw new DuplicateEntityError(`Reference catalog identifier is duplicated: ${id}.`)
    ids.add(id)
  }
  const choirIds = new Set<string>(catalog.choirs.map((choir) => choir.id))
  for (const choir of catalog.choirs) addId(choir.id)
  for (const section of catalog.sections) {
    addId(section.id)
    if (!choirIds.has(section.choirId))
      throw new InvalidRelationshipError(`Section ${section.id} references an unknown Choir.`)
    if (!/^(S|A|T|B)([12])?$/.test(section.voiceType))
      throw new InvalidRelationshipError(`Section ${section.id} uses an invalid Voice Type.`)
    const allowedVoiceTypes = section.allowedVoiceTypes ?? [section.voiceType]
    if (!allowedVoiceTypes.every((voiceType) => /^(S|A|T|B)[12]$/.test(voiceType)))
      throw new InvalidRelationshipError(`Section ${section.id} uses an invalid Voice Type in its allowed types.`)
    if (section.voiceType.length === 1 && allowedVoiceTypes.some((voiceType) => voiceType[0] !== section.voiceType))
      throw new InvalidRelationshipError(`Section ${section.id} allows a mismatched Voice Type family.`)
    if (section.voiceType.length === 2 && allowedVoiceTypes.length !== 1)
      throw new InvalidRelationshipError(`Fine-grained Section ${section.id} must allow exactly one Voice Type.`)
  }
  const groupIds = new Set<string>()
  const groupNames = new Set<string>()
  for (const group of catalog.groups) {
    addId(group.id)
    if (groupIds.has(group.id)) throw new DuplicateEntityError(`Group identifier is duplicated: ${group.id}.`)
    groupIds.add(group.id)
    if (group.scope.type === 'choir' && !choirIds.has(group.scope.choirId))
      throw new InvalidRelationshipError(`Group ${group.id} references an unknown Choir.`)
    const scopeKey = group.scope.type === 'csk' ? 'csk' : group.scope.choirId
    const nameKey = `${scopeKey}:${group.name}`
    if (groupNames.has(nameKey)) throw new DuplicateEntityError(`Group name is duplicated within scope: ${group.name}.`)
    groupNames.add(nameKey)
  }
  const positionIds = new Set<string>()
  for (const position of catalog.positions) {
    addId(position.id)
    positionIds.add(position.id)
    for (const scope of position.scopes) {
      if (scope.type === 'choir' && !choirIds.has(scope.choirId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Choir.`)
      if (scope.type === 'section' && !catalog.sections.some((section) => section.id === scope.sectionId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Section.`)
      if (scope.type === 'group' && !groupIds.has(scope.groupId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Group.`)
    }
  }
  if (positionIds.size !== catalog.positions.length)
    throw new DuplicateEntityError('Position identifiers must be unique.')
  return catalog
}

export async function synchronizeReferenceCatalog(
  database: typeof db,
  catalog: ReferenceCatalog = referenceCatalog,
): Promise<void> {
  const validated = validateReferenceCatalog(catalog)
  await database.transaction(async (transaction) => {
    for (const record of validated.choirs)
      await transaction.insert(choir).values(record).onConflictDoUpdate({ target: choir.id, set: record })
    for (const record of validated.sections)
      await transaction
        .insert(section)
        .values({ id: record.id, choirId: record.choirId, name: record.name, voiceType: record.voiceType })
        .onConflictDoUpdate({
          target: section.id,
          set: { choirId: record.choirId, name: record.name, voiceType: record.voiceType },
        })
    for (const record of validated.groups) {
      const scope =
        record.scope.type === 'csk'
          ? { scopeType: 'csk' as const, scopeKey: 'csk', choirId: null }
          : { scopeType: 'choir' as const, scopeKey: record.scope.choirId, choirId: record.scope.choirId }
      await transaction
        .insert(group)
        .values({
          id: record.id,
          kind: record.kind.toLowerCase() as 'committee' | 'board',
          name: record.name,
          ...scope,
        })
        .onConflictDoUpdate({
          target: group.id,
          set: { kind: record.kind.toLowerCase() as 'committee' | 'board', name: record.name, ...scope },
        })
    }
    for (const record of validated.positions)
      await transaction
        .insert(position)
        .values({ id: record.id, name: record.name })
        .onConflictDoUpdate({ target: position.id, set: { name: record.name } })
    for (const position of validated.positions) {
      for (const scope of position.scopes) {
        const target =
          scope.type === 'csk'
            ? { targetType: 'csk' as const, targetKey: 'csk', choirId: null, sectionId: null, groupId: null }
            : scope.type === 'choir'
              ? {
                  targetType: 'choir' as const,
                  targetKey: scope.choirId,
                  choirId: scope.choirId,
                  sectionId: null,
                  groupId: null,
                }
              : scope.type === 'section'
                ? {
                    targetType: 'section' as const,
                    targetKey: scope.sectionId,
                    choirId: null,
                    sectionId: scope.sectionId,
                    groupId: null,
                  }
                : {
                    targetType: 'group' as const,
                    targetKey: scope.groupId,
                    choirId: null,
                    sectionId: null,
                    groupId: scope.groupId,
                  }
        await transaction
          .insert(positionScope)
          .values({ positionId: position.id, ...target })
          .onConflictDoNothing({
            target: [positionScope.positionId, positionScope.targetType, positionScope.targetKey],
          })
      }
    }
  })
}

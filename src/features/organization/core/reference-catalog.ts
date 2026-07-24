import type { Database } from '@/core/db/database'
import { DuplicateEntityError, InvalidRelationshipError } from './errors'

export const choirCatalog = [
  { id: 'mk', name: 'Manskören', shortName: 'MK' },
  { id: 'kk', name: 'Kammarkören', shortName: 'KK' },
  { id: 'dk', name: 'Damkören', shortName: 'DK' },
] as const

const choirSections = {
  mk: ['T1', 'T2', 'B1', 'B2'],
  kk: ['S1', 'S2', 'A1', 'A2', 'T1', 'T2', 'B1', 'B2'],
  dk: ['S1', 'S2', 'A1', 'A2'],
} as const

export type SectionVoiceType = (typeof choirSections)[keyof typeof choirSections][number]

export const sectionCatalog = choirCatalog.flatMap((choir) =>
  choirSections[choir.id].map((voiceType) => ({
    id: `${choir.id}-${voiceType.toLowerCase()}`,
    choirId: choir.id,
    name: voiceType,
    voiceType,
  })),
)

export type CatalogGroup = {
  id: string
  kind: 'COMMITTEE' | 'BOARD'
  name: string
  scope: { type: 'csk' } | { type: 'choir'; choirId: string }
}

export const groupCatalog: readonly CatalogGroup[] = [
  { id: 'board', kind: 'BOARD', name: 'Board', scope: { type: 'csk' } },
  ...[
    ['concert-mastery', 'Concert Mastery'],
    ['gig-mastery', 'Gig Mastery'],
    ['party-mastery', 'Party Mastery'],
    ['web-mastery', 'Web Mastery'],
    ['tour-committee', 'Tour Committee'],
    ['recruitment-committee', 'Recruitment Committee'],
  ].map(([id, name]) => ({ id, kind: 'COMMITTEE' as const, name, scope: { type: 'csk' as const } })),
  ...choirCatalog.flatMap((choir) =>
    [
      ['concert', 'Concert'],
      ['party', 'Party'],
      ['rodd', 'Rodd'],
    ].map(([id, name]) => ({
      id: `${choir.id}-${id}`,
      kind: 'COMMITTEE' as const,
      name: `${name} Group`,
      scope: { type: 'choir' as const, choirId: choir.id },
    })),
  ),
]

type PositionDefinition = { id: string; name: string; scopes: PositionScopeDefinition[] }
type PositionScopeDefinition =
  | { type: 'csk' }
  | { type: 'choir'; choirId: string }
  | { type: 'section'; sectionId: string }
  | { type: 'group'; groupId: string }

const boardOfficeScopes = [
  ['president', 'President'],
  ['vice-president', 'Vice President'],
  ['treasurer', 'Treasurer'],
  ['secretary', 'Secretary'],
  ['master-of-parties', 'Master of Parties'],
  ['master-of-gigs', 'Master of Gigs'],
  ['master-of-concerts', '1st Master of Concerts'],
  ['master-of-pr', 'Master of PR'],
] as const

export const positionCatalog: readonly PositionDefinition[] = [
  ...boardOfficeScopes.map(([id, name]) => ({
    id,
    name,
    scopes: [
      {
        type: 'group' as const,
        groupId:
          id === 'master-of-parties'
            ? 'board'
            : id === 'master-of-gigs'
              ? 'board'
              : id === 'master-of-concerts'
                ? 'board'
                : id === 'master-of-pr'
                  ? 'board'
                  : 'board',
      },
      ...(id === 'master-of-parties' ? [{ type: 'group' as const, groupId: 'party-mastery' }] : []),
      ...(id === 'master-of-gigs' ? [{ type: 'group' as const, groupId: 'gig-mastery' }] : []),
      ...(id === 'master-of-concerts' ? [{ type: 'group' as const, groupId: 'concert-mastery' }] : []),
    ],
  })),
  ...choirCatalog.flatMap((choir) =>
    [
      ['conductor', 'Conductor', []],
      ['master-of-concerts', 'Master of Concerts', ['concert-mastery']],
      ['master-of-gigs', 'Master of Gigs', ['gig-mastery']],
    ].map(([kind, name, masteryIds]) => ({
      id: `${choir.id}-${kind}`,
      name: name as string,
      scopes: [
        { type: 'choir' as const, choirId: choir.id },
        ...(masteryIds as string[]).map((groupId) => ({ type: 'group' as const, groupId })),
      ],
    })),
  ),
  { id: 'party-mistress', name: 'Party Mistress', scopes: [{ type: 'group', groupId: 'party-mastery' }] },
  { id: 'tour-treasurer', name: 'Treasurer', scopes: [{ type: 'group', groupId: 'tour-committee' }] },
  ...(['mk', 'dk'] as const).flatMap((choirId) =>
    choirSections[choirId].map((voiceType) => ({
      id: `${choirId}-${voiceType.toLowerCase()}-voice-parent`,
      name: 'Voice Parent',
      scopes: [{ type: 'section' as const, sectionId: `${choirId}-${voiceType.toLowerCase()}` }],
    })),
  ),
  ...[
    ['s', 'S1', 'S2'],
    ['a', 'A1', 'A2'],
    ['t', 'T1', 'T2'],
    ['b', 'B1', 'B2'],
  ].map(([id, first, second]) => ({
    id: `kk-${id}-voice-parent`,
    name: 'Voice Parent',
    scopes: [
      { type: 'section' as const, sectionId: `kk-${first.toLowerCase()}` },
      { type: 'section' as const, sectionId: `kk-${second.toLowerCase()}` },
    ],
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
    if (!/^(S|A|T|B)[12]$/.test(section.voiceType))
      throw new InvalidRelationshipError(`Section ${section.id} uses an invalid Voice Type.`)
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
  database: Database,
  catalog: ReferenceCatalog = referenceCatalog,
): Promise<void> {
  const validated = validateReferenceCatalog(catalog)
  await database.$transaction(async (transaction) => {
    for (const record of validated.choirs)
      await transaction.choir.upsert({ where: { id: record.id }, create: record, update: record })
    for (const record of validated.sections)
      await transaction.section.upsert({ where: { id: record.id }, create: record, update: record })
    for (const record of validated.groups) {
      const scope =
        record.scope.type === 'csk'
          ? { scopeType: 'csk' as const, scopeKey: 'csk', choirId: null }
          : { scopeType: 'choir' as const, scopeKey: record.scope.choirId, choirId: record.scope.choirId }
      await transaction.group.upsert({
        where: { id: record.id },
        create: { id: record.id, kind: record.kind, name: record.name, ...scope },
        update: { kind: record.kind, name: record.name, ...scope },
      })
    }
    for (const record of validated.positions)
      await transaction.position.upsert({
        where: { id: record.id },
        create: { id: record.id, name: record.name },
        update: { name: record.name },
      })
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
        await transaction.positionScope.upsert({
          where: {
            positionId_targetType_targetKey: {
              positionId: position.id,
              targetType: target.targetType,
              targetKey: target.targetKey,
            },
          },
          create: { positionId: position.id, ...target },
          update: {},
        })
      }
    }
  })
}

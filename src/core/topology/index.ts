import { topologyData } from './data'
import { DuplicateEntityError, InvalidRelationshipError } from './errors'

export { topologyData } from './data'
export { DuplicateEntityError, InvalidRelationshipError } from './errors'

export type TopologyStatus = 'active' | 'retired'
export type VoiceType = 'S' | 'S1' | 'S2' | 'A' | 'A1' | 'A2' | 'T' | 'T1' | 'T2' | 'B' | 'B1' | 'B2'
export type FineVoiceType = Exclude<VoiceType, 'S' | 'A' | 'T' | 'B'>

export type ChoirId = (typeof topologyData.choirs)[number]['id']
export type SectionId = (typeof topologyData.sections)[number]['id']
export type GroupId = (typeof topologyData.groups)[number]['id']
export type PositionId = (typeof topologyData.positions)[number]['id']
export type GroupKind = 'committee' | 'board'

export type Choir = {
  readonly id: ChoirId
  readonly name: string
  readonly shortName: string
  readonly status: TopologyStatus
}
export type Section = {
  readonly id: SectionId
  readonly choirId: ChoirId
  readonly name: string
  readonly allowedVoiceTypes: readonly FineVoiceType[]
  readonly status: TopologyStatus
}
export type GroupScope = { readonly type: 'csk' } | { readonly type: 'choir'; readonly choirId: ChoirId }
export type Group = {
  readonly id: GroupId
  readonly kind: GroupKind
  readonly name: string
  readonly scope: GroupScope
  readonly status: TopologyStatus
}
export type PositionScope =
  | { readonly type: 'csk' }
  | { readonly type: 'choir'; readonly choirId: ChoirId }
  | { readonly type: 'section'; readonly sectionId: SectionId }
  | { readonly type: 'group'; readonly groupId: GroupId }
export type Position = {
  readonly id: PositionId
  readonly name: string
  readonly scopes: readonly PositionScope[]
  readonly status: TopologyStatus
}
export type Topology = {
  readonly choirs: readonly Choir[]
  readonly sections: readonly Section[]
  readonly groups: readonly Group[]
  readonly positions: readonly Position[]
}

function withDefaultStatus<T extends { readonly id: string }>(
  entity: T & { readonly status?: TopologyStatus },
): Omit<T, 'status'> & { readonly status: TopologyStatus } {
  return { ...entity, status: entity.status ?? 'active' }
}

export const topology: Topology = {
  choirs: topologyData.choirs.map((choir) => withDefaultStatus(choir)),
  sections: topologyData.sections.map((section) => withDefaultStatus(section)),
  groups: topologyData.groups.map((group) => withDefaultStatus(group)),
  positions: topologyData.positions.map((position) => withDefaultStatus(position)),
}

export const GroupKind = { COMMITTEE: 'committee', BOARD: 'board' } as const

const choirsById = new Map<string, Choir>(topology.choirs.map((choir) => [choir.id, choir]))
const sectionsById = new Map<string, Section>(topology.sections.map((section) => [section.id, section]))
const groupsById = new Map<string, Group>(topology.groups.map((group) => [group.id, group]))
const positionsById = new Map<string, Position>(topology.positions.map((position) => [position.id, position]))

export function listChoirs(): readonly Choir[] {
  return topology.choirs.filter((choir) => choir.status === 'active')
}

export function listSections(): readonly Section[] {
  return topology.sections.filter((section) => section.status === 'active')
}

export function listGroups(): readonly Group[] {
  return topology.groups.filter((group) => group.status === 'active')
}

export function listRetiredGroups(): readonly Group[] {
  return topology.groups.filter((group) => group.status === 'retired')
}

export function listPositions(): readonly Position[] {
  return topology.positions.filter((position) => position.status === 'active')
}

export function listRetiredPositions(): readonly Position[] {
  return topology.positions.filter((position) => position.status === 'retired')
}

export function getChoir(id: string): Choir | undefined {
  return choirsById.get(id)
}

export function getSection(id: string): Section | undefined {
  return sectionsById.get(id)
}

export function getGroup(id: string): Group | undefined {
  return groupsById.get(id)
}

export function getPosition(id: string): Position | undefined {
  return positionsById.get(id)
}

export function isActiveTopologyEntity(entity: { status: TopologyStatus }): boolean {
  return entity.status === 'active'
}

export function validateTopology(candidate: Topology = topology): Topology {
  const ids = new Set<string>()
  const addId = (id: string) => {
    if (ids.has(id)) throw new DuplicateEntityError(`Topology identifier is duplicated: ${id}.`)
    ids.add(id)
  }
  const choirIds = new Set(candidate.choirs.map((choir) => choir.id))
  for (const choir of candidate.choirs) {
    addId(choir.id)
    assertStatus(choir.status, `Choir ${choir.id}`)
  }

  for (const section of candidate.sections) {
    addId(section.id)
    assertStatus(section.status, `Section ${section.id}`)
    if (!choirIds.has(section.choirId))
      throw new InvalidRelationshipError(`Section ${section.id} references an unknown Choir.`)
    if (section.allowedVoiceTypes.length === 0)
      throw new InvalidRelationshipError(`Section ${section.id} must allow at least one Voice Type.`)
    if (!section.allowedVoiceTypes.every((voiceType) => /^(S|A|T|B)[12]$/.test(voiceType)))
      throw new InvalidRelationshipError(`Section ${section.id} uses an invalid Voice Type in its allowed types.`)
    if (new Set(section.allowedVoiceTypes.map((voiceType) => voiceType[0])).size !== 1)
      throw new InvalidRelationshipError(`Section ${section.id} allows a mismatched Voice Type family.`)
  }

  const groupIds = new Set<string>()
  const groupNames = new Set<string>()
  for (const group of candidate.groups) {
    addId(group.id)
    assertStatus(group.status, `Group ${group.id}`)
    if (groupIds.has(group.id)) throw new DuplicateEntityError(`Group identifier is duplicated: ${group.id}.`)
    groupIds.add(group.id)
    if (group.scope.type === 'choir' && !choirIds.has(group.scope.choirId))
      throw new InvalidRelationshipError(`Group ${group.id} references an unknown Choir.`)
    const scopeKey = group.scope.type === 'csk' ? 'csk' : group.scope.choirId
    const nameKey = `${scopeKey}:${group.name}`
    if (groupNames.has(nameKey)) throw new DuplicateEntityError(`Group name is duplicated within scope: ${group.name}.`)
    groupNames.add(nameKey)
  }

  const sectionIds = new Set(candidate.sections.map((section) => section.id))
  const positionIds = new Set<string>()
  for (const position of candidate.positions) {
    addId(position.id)
    assertStatus(position.status, `Position ${position.id}`)
    if (positionIds.has(position.id)) throw new DuplicateEntityError(`Position identifiers must be unique.`)
    positionIds.add(position.id)
    for (const scope of position.scopes) {
      if (scope.type === 'choir' && !choirIds.has(scope.choirId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Choir.`)
      if (scope.type === 'section' && !sectionIds.has(scope.sectionId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Section.`)
      if (scope.type === 'group' && !groupIds.has(scope.groupId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Group.`)
    }
  }
  return candidate
}

function assertStatus(status: string, label: string): asserts status is TopologyStatus {
  if (status !== 'active' && status !== 'retired') throw new InvalidRelationshipError(`${label} has an invalid status.`)
}

validateTopology()

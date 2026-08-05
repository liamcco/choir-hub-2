/**
 * The typed, persistence-free source of truth for CSK's Permanent Organization Topology.
 * External identifiers must be resolved with a `resolve*` helper before entering domain logic;
 * strict `get*` helpers are reserved for already validated topology IDs.
 */
import type {
  Choir as CoreChoir,
  Group as CoreGroup,
  GroupKind as CoreGroupKind,
  Position as CorePosition,
  Section as CoreSection,
  TopologyScopeType as CoreTopologyScopeType,
  TopologyLifecycleStatus,
} from '@/core/types'
import { baseVoice, isBaseVoice, isFineVoice } from '@/core/types'
import { topologyData } from './data'
import { DuplicateEntityError, InvalidRelationshipError } from './errors'
import type { Topology as CoreTopology } from './types'

export { topologyData } from './data'
export { DuplicateEntityError, InvalidRelationshipError } from './errors'
export type { Topology, TopologyData } from './types'

/** Runtime discriminators used by every topology scope. */
export const TOPOLOGY_SCOPE_TYPES = {
  CSK: 'csk',
  CHOIR: 'choir',
  SECTION: 'section',
  GROUP: 'group',
} as const
export type TopologyScopeType = CoreTopologyScopeType

export type ChoirId = (typeof topologyData.choirs)[number]['id']
export type SectionId = (typeof topologyData.sections)[number]['id']
export type GroupId = (typeof topologyData.groups)[number]['id']
export type PositionId = (typeof topologyData.positions)[number]['id']
export type GroupKind = CoreGroupKind
/** Stable display order for Choirs in administrative collections. */
export const CHOIR_IDS = { KK: 'kk', MK: 'mk', DK: 'dk' } as const satisfies Record<string, ChoirId>
/** Runtime identifier vocabularies for narrowing untrusted topology references. */
export const CHOIR_ID_VALUES: readonly ChoirId[] = topologyData.choirs.map(({ id }) => id)
export const SECTION_ID_VALUES: readonly SectionId[] = topologyData.sections.map(({ id }) => id)
export const GROUP_ID_VALUES: readonly GroupId[] = topologyData.groups.map(({ id }) => id)
export const POSITION_ID_VALUES: readonly PositionId[] = topologyData.positions.map(({ id }) => id)

export type Choir = Omit<CoreChoir, 'id' | 'status'> & {
  readonly id: ChoirId
  readonly status: TopologyLifecycleStatus
}
export type Section = Omit<CoreSection, 'id' | 'choirId' | 'status'> & {
  readonly id: SectionId
  readonly choirId: ChoirId
  readonly status: TopologyLifecycleStatus
}
export type GroupScope =
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.CSK }
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.CHOIR; readonly choirId: ChoirId }
export type Group = Omit<CoreGroup, 'id' | 'scope' | 'status'> & {
  readonly id: GroupId
  readonly scope: GroupScope
  readonly status: TopologyLifecycleStatus
}
export type PositionScope =
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.CSK }
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.CHOIR; readonly choirId: ChoirId }
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.SECTION; readonly sectionId: SectionId }
  | { readonly type: typeof TOPOLOGY_SCOPE_TYPES.GROUP; readonly groupId: GroupId }
export type Position = Omit<CorePosition, 'id' | 'scopes' | 'status'> & {
  readonly id: PositionId
  readonly scopes: readonly PositionScope[]
  readonly status: TopologyLifecycleStatus
}
function withDefaultStatus<T extends { readonly id: string }>(
  entity: T & { readonly status?: TopologyLifecycleStatus },
): Omit<T, 'status'> & { readonly status: TopologyLifecycleStatus } {
  return { ...entity, status: entity.status ?? 'active' }
}

export const topology: CoreTopology<Choir, Section, Group, Position> = {
  choirs: topologyData.choirs.map((choir) => withDefaultStatus(choir)),
  sections: topologyData.sections.map((section) => withDefaultStatus(section)),
  groups: topologyData.groups.map((group) => withDefaultStatus(group)),
  positions: topologyData.positions.map((position) => withDefaultStatus(position)),
}

export const GROUP_KINDS = { COMMITTEE: 'committee', BOARD: 'board' } as const satisfies Record<string, CoreGroupKind>

const choirsById = new Map<string, Choir>(topology.choirs.map((choir) => [choir.id, choir]))
const sectionsById = new Map<string, Section>(topology.sections.map((section) => [section.id, section]))
const groupsById = new Map<string, Group>(topology.groups.map((group) => [group.id, group]))
const positionsById = new Map<string, Position>(topology.positions.map((position) => [position.id, position]))

export function listChoirs(): readonly Choir[] {
  return topology.choirs.filter((choir) => choir.status === 'active')
}

/** Lists active Choirs in the established administrative display order. */
export function listChoirsInDisplayOrder(): readonly Choir[] {
  const choirsById = new Map(topology.choirs.map((choir) => [choir.id, choir]))
  return [CHOIR_IDS.KK, CHOIR_IDS.MK, CHOIR_IDS.DK].flatMap((id) => {
    const choir = choirsById.get(id)
    return choir?.status === 'active' ? [choir] : []
  })
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

/** Returns a known Choir, including retired Choirs, for an already validated ID. */
export function getChoir(id: ChoirId): Choir | undefined {
  return choirsById.get(id)
}

/** Returns a known Section, including retired Sections, for an already validated ID. */
export function getSection(id: SectionId): Section | undefined {
  return sectionsById.get(id)
}

/** Returns a known Group, including retired Groups, for an already validated ID. */
export function getGroup(id: GroupId): Group | undefined {
  return groupsById.get(id)
}

/** Returns a known Position, including retired Positions, for an already validated ID. */
export function getPosition(id: PositionId): Position | undefined {
  return positionsById.get(id)
}

/** Resolves an untrusted external value to a known Choir. */
export function resolveChoir(rawId: string): Choir | undefined {
  return choirsById.get(rawId)
}

/** Resolves an untrusted external value to a known Section. */
export function resolveSection(rawId: string): Section | undefined {
  return sectionsById.get(rawId)
}

/** Resolves an untrusted external value to a known Group. */
export function resolveGroup(rawId: string): Group | undefined {
  return groupsById.get(rawId)
}

/** Resolves an untrusted external value to a known Position. */
export function resolvePosition(rawId: string): Position | undefined {
  return positionsById.get(rawId)
}

export function isActiveTopologyEntity(entity: { status: TopologyLifecycleStatus }): boolean {
  return entity.status === 'active'
}

export function validateTopology(candidate: CoreTopology = topology): CoreTopology {
  const ids = new Set<string>()
  const choirIds = new Set(candidate.choirs.map((choir) => choir.id))
  validateChoirs(candidate.choirs, ids)
  validateSections(candidate.sections, choirIds, ids)
  const groupIds = validateGroups(candidate.groups, choirIds, ids)
  const sectionIds = new Set(candidate.sections.map((section) => section.id))
  validatePositions(candidate.positions, choirIds, sectionIds, groupIds, ids)
  return candidate
}

function validateChoirs(choirs: readonly CoreTopology['choirs'][number][], ids: Set<string>) {
  for (const choir of choirs) {
    assertUniqueId(choir.id, ids)
    assertStatus(choir.status, `Choir ${choir.id}`)
  }
}

function validateSections(
  sections: readonly CoreTopology['sections'][number][],
  choirIds: ReadonlySet<string>,
  ids: Set<string>,
) {
  for (const section of sections) {
    assertUniqueId(section.id, ids)
    assertStatus(section.status, `Section ${section.id}`)
    if (!choirIds.has(section.choirId))
      throw new InvalidRelationshipError(`Section ${section.id} references an unknown Choir.`)
    if (section.allowedVoices.length === 0)
      throw new InvalidRelationshipError(`Section ${section.id} must allow at least one Voice.`)
    if (!section.allowedVoices.every(isFineVoice))
      throw new InvalidRelationshipError(`Section ${section.id} uses an invalid Voice in its allowed voices.`)
    if (new Set(section.allowedVoices.map(baseVoice)).size !== 1)
      throw new InvalidRelationshipError(`Section ${section.id} allows a mismatched Voice family.`)
  }
}

function validateGroups(
  groups: readonly CoreTopology['groups'][number][],
  choirIds: ReadonlySet<string>,
  ids: Set<string>,
) {
  const groupIds = new Set<string>()
  const groupNames = new Set<string>()
  for (const group of groups) {
    assertUniqueId(group.id, ids)
    assertStatus(group.status, `Group ${group.id}`)
    groupIds.add(group.id)
    if (group.scope.type === TOPOLOGY_SCOPE_TYPES.CHOIR && !choirIds.has(group.scope.choirId))
      throw new InvalidRelationshipError(`Group ${group.id} references an unknown Choir.`)
    const scopeKey = group.scope.type === TOPOLOGY_SCOPE_TYPES.CSK ? 'csk' : group.scope.choirId
    const nameKey = `${scopeKey}:${group.name}`
    if (groupNames.has(nameKey)) throw new DuplicateEntityError(`Group name is duplicated within scope: ${group.name}.`)
    groupNames.add(nameKey)
  }
  return groupIds
}

function validatePositions(
  positions: readonly CoreTopology['positions'][number][],
  choirIds: ReadonlySet<string>,
  sectionIds: ReadonlySet<string>,
  groupIds: ReadonlySet<string>,
  ids: Set<string>,
) {
  for (const position of positions) {
    assertUniqueId(position.id, ids)
    assertStatus(position.status, `Position ${position.id}`)
    for (const scope of position.scopes) {
      if (scope.type === TOPOLOGY_SCOPE_TYPES.CHOIR && !choirIds.has(scope.choirId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Choir.`)
      if (scope.type === TOPOLOGY_SCOPE_TYPES.SECTION && !sectionIds.has(scope.sectionId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Section.`)
      if (scope.type === TOPOLOGY_SCOPE_TYPES.GROUP && !groupIds.has(scope.groupId))
        throw new InvalidRelationshipError(`Position ${position.id} references an unknown Group.`)
    }
    validatePositionEligibility(position)
  }
}

function assertUniqueId(id: string, ids: Set<string>) {
  if (ids.has(id)) throw new DuplicateEntityError(`Topology identifier is duplicated: ${id}.`)
  ids.add(id)
}

function validatePositionEligibility(position: CorePosition) {
  const eligibility = position.eligibility
  if (!eligibility) return
  if (eligibility.mode !== 'all' && eligibility.mode !== 'any')
    throw new InvalidRelationshipError(`Position ${position.id} uses an invalid eligibility mode.`)

  let memberStatusRequirements = 0
  for (const requirement of eligibility.requirements) {
    if (requirement.type === 'memberStatus') {
      memberStatusRequirements += 1
      if (requirement.value !== 'activeOnly' && requirement.value !== 'formerAllowed')
        throw new InvalidRelationshipError(`Position ${position.id} uses an invalid Member Status requirement.`)
      continue
    }
    if (requirement.voices.length === 0)
      throw new InvalidRelationshipError(`Position ${position.id} must name at least one Voice Capability.`)
    if (!requirement.voices.every((voice) => isBaseVoice(voice) || isFineVoice(voice)))
      throw new InvalidRelationshipError(`Position ${position.id} uses an invalid Voice Capability.`)
  }
  if (memberStatusRequirements > 1)
    throw new InvalidRelationshipError(`Position ${position.id} declares Member Status eligibility more than once.`)
}

function assertStatus(status: string | undefined, label: string): asserts status is TopologyLifecycleStatus {
  if (status !== 'active' && status !== 'retired') throw new InvalidRelationshipError(`${label} has an invalid status.`)
}

validateTopology()

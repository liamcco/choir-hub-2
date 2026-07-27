import type { FineVoice, Voice } from './voice'

export type TopologyLifecycleStatus = 'active' | 'retired'
export type TopologyScopeType = 'csk' | 'choir' | 'section' | 'group'
export type GroupKind = 'committee' | 'board'

export type Choir = {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly status?: TopologyLifecycleStatus
}

export type Section = {
  readonly id: string
  readonly choirId: string
  readonly name: string
  readonly allowedVoices: readonly FineVoice[]
  readonly status?: TopologyLifecycleStatus
}

export type GroupScope = { readonly type: 'csk' } | { readonly type: 'choir'; readonly choirId: string }

export type Group = {
  readonly id: string
  readonly kind: GroupKind
  readonly name: string
  readonly scope: GroupScope
  readonly status?: TopologyLifecycleStatus
}

export type PositionScope =
  | { readonly type: 'csk' }
  | { readonly type: 'choir'; readonly choirId: string }
  | { readonly type: 'section'; readonly sectionId: string }
  | { readonly type: 'group'; readonly groupId: string }

export type PositionAssignmentEligibilityRequirement =
  | { readonly type: 'memberStatus'; readonly value: 'activeOnly' | 'formerAllowed' }
  | { readonly type: 'voiceCapability'; readonly voices: readonly Voice[] }

export type PositionAssignmentEligibility = {
  readonly mode: 'all' | 'any'
  readonly requirements: readonly PositionAssignmentEligibilityRequirement[]
}

export type Position = {
  readonly id: string
  readonly name: string
  readonly scopes: readonly PositionScope[]
  readonly eligibility?: PositionAssignmentEligibility
  readonly status?: TopologyLifecycleStatus
}

export type TopologyCollections<
  ChoirType extends Choir = Choir,
  SectionType extends Section = Section,
  GroupType extends Group = Group,
  PositionType extends Position = Position,
> = {
  readonly choirs: readonly ChoirType[]
  readonly sections: readonly SectionType[]
  readonly groups: readonly GroupType[]
  readonly positions: readonly PositionType[]
}

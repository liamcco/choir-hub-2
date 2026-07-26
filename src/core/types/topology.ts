import type { FineVoice } from './voice'

export type TopologyStatus = 'active' | 'retired'
export type TopologyScopeType = 'csk' | 'choir' | 'section' | 'group'
export type GroupKind = 'committee' | 'board'

export type Choir = {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly status?: TopologyStatus
}

export type Section = {
  readonly id: string
  readonly choirId: string
  readonly name: string
  readonly allowedVoices: readonly FineVoice[]
  readonly status?: TopologyStatus
}

export type GroupScope = { readonly type: 'csk' } | { readonly type: 'choir'; readonly choirId: string }

export type Group = {
  readonly id: string
  readonly kind: GroupKind
  readonly name: string
  readonly scope: GroupScope
  readonly status?: TopologyStatus
}

export type PositionScope =
  | { readonly type: 'csk' }
  | { readonly type: 'choir'; readonly choirId: string }
  | { readonly type: 'section'; readonly sectionId: string }
  | { readonly type: 'group'; readonly groupId: string }

export type Position = {
  readonly id: string
  readonly name: string
  readonly scopes: readonly PositionScope[]
  readonly status?: TopologyStatus
}

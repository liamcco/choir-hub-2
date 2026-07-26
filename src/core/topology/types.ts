import type { Choir, Group, Position, Section } from '@/core/types'

/** Shape of the static, code-controlled topology catalog. */
export type TopologyData = {
  readonly choirs: readonly Choir[]
  readonly sections: readonly Section[]
  readonly groups: readonly Group[]
  readonly positions: readonly Position[]
}

/** Runtime topology aggregate after lifecycle defaults have been applied. */
export type Topology<
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

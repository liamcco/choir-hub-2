import type { Choir, Group, Position, Section, TopologyCollections } from '@/core/types'

/** Shape of the static, code-controlled topology catalog. */
export type TopologyData = TopologyCollections

/** Runtime topology aggregate after lifecycle defaults have been applied. */
export type Topology<
  ChoirType extends Choir = Choir,
  SectionType extends Section = Section,
  GroupType extends Group = Group,
  PositionType extends Position = Position,
> = TopologyCollections<ChoirType, SectionType, GroupType, PositionType>

import type { Group } from '@/core/topology'

/** Groups are flat in V1; a label is therefore just the group's display name. */
export function formatGroupName(_groups: readonly Group[], group: Pick<Group, 'name'>) {
  return group.name
}

export function buildGroupNameMap(groups: readonly Group[]) {
  return new Map(groups.map((group) => [group.id, group.name]))
}
export {
  formatFineGrainedPlacementName,
  formatPositionLabel,
  formatPositionScopeLabel,
  formatSectionName,
} from '@/features/organization/core/labels/position'
export type { UserDisplayOption } from '@/features/organization/core/labels/user'
export {
  buildUserDisplayOptionMap,
  buildUserDisplayOptions,
  formatUserFallbackLabel,
} from '@/features/organization/core/labels/user'

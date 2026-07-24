import type { Group } from '@/drizzle/schema'

/** Groups are flat in V1; a label is therefore just the group's display name. */
export function formatGroupPath(_groups: Group[], group: Pick<Group, 'name'>) {
  return group.name
}

export function buildGroupPathLabels(groups: Group[]) {
  return new Map(groups.map((group) => [group.id, group.name]))
}
export type { UserLabel } from '@/features/organization/core/labels/member'
export { buildUserLabels, formatUserFallbackLabel } from '@/features/organization/core/labels/member'
export { formatPositionScopeLabel } from '@/features/organization/core/labels/position'

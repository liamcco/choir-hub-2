import type { Group } from '@/drizzle/schema'
import { formatGroupPath } from '@/features/organization/core/group-tree'

export const noGroupScopesLabel = 'No Group scopes'

export function formatPositionScopeLabel(groups: Group[], scopeGroups: Group[]) {
  if (scopeGroups.length === 0) {
    return noGroupScopesLabel
  }

  return scopeGroups.map((group) => formatGroupPath(groups, group)).join(' + ')
}

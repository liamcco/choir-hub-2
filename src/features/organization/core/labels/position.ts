import { formatGroupPath } from '@/features/organization/core/group-tree'
import type { Group } from '@/prisma/generated/client'

export const noGroupScopesLabel = 'No Group scopes'

export function formatPositionScopeLabel(groups: Group[], scopeGroups: Group[]) {
  if (scopeGroups.length === 0) {
    return noGroupScopesLabel
  }

  return scopeGroups.map((group) => formatGroupPath(groups, group)).join(' + ')
}

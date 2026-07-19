import { formatGroupPath } from '@/organization/group-labels'
import type { OrganizationRecord } from '@/organization/types'

export const noGroupScopesLabel = 'No Group scopes'

export function formatPositionScopeLabel(
  groups: OrganizationRecord<'group'>[],
  scopeGroups: OrganizationRecord<'group'>[],
) {
  if (scopeGroups.length === 0) {
    return noGroupScopesLabel
  }

  return scopeGroups.map((group) => formatGroupPath(groups, group)).join(' + ')
}

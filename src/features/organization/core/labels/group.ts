import { buildGroupPathLookup } from '@/features/organization/core/group-tree'
import type { Group } from '@/prisma/generated/client'

export function formatGroupPath(groups: Group[], group: Group) {
  return buildGroupPathLookup(groups).get(group.id) ?? group.name
}

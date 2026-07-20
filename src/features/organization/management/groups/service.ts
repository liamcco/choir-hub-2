import { organizationService } from '@/features/organization'
import { buildGroupHierarchy as buildOrganizationGroupHierarchy } from '@/features/organization/core/group-tree'
import type { GroupTreeNode } from '@/features/organization/core/group-tree'
import type { Group } from '@/prisma/generated/client'

export type GroupHierarchyNode = GroupTreeNode

export async function listGroups(): Promise<Group[]> {
  const groups = await organizationService.groups.list()
  return groups
}

export function buildGroupHierarchy(groups: Group[]): GroupHierarchyNode[] {
  return buildOrganizationGroupHierarchy(groups)
}

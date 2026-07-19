import { organizationService } from '@/organization'
import type { Group } from '@/prisma/generated/client'

export type GroupHierarchyNode = {
  group: Group
  depth: number
  children: GroupHierarchyNode[]
}

export async function listGroups(): Promise<Group[]> {
  const groups = await organizationService.groups.list()
  return groups
}

export function buildGroupHierarchy(groups: Group[]): GroupHierarchyNode[] {
  const nodes = new Map<string, GroupHierarchyNode>()
  const roots: GroupHierarchyNode[] = []

  for (const group of groups) {
    nodes.set(group.id, { group, depth: 0, children: [] })
  }
  for (const group of groups) {
    const node = nodes.get(group.id)
    if (!node) continue
    const parent = group.parentGroupId ? nodes.get(group.parentGroupId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  assignDepths(roots, 0)
  sortHierarchy(roots)
  return roots
}

function assignDepths(nodes: GroupHierarchyNode[], depth: number): void {
  for (const node of nodes) {
    node.depth = depth
    assignDepths(node.children, depth + 1)
  }
}

function sortHierarchy(nodes: GroupHierarchyNode[]): void {
  nodes.sort(
    (first, second) =>
      first.group.name.localeCompare(second.group.name) || first.group.id.localeCompare(second.group.id),
  )
  for (const node of nodes) sortHierarchy(node.children)
}

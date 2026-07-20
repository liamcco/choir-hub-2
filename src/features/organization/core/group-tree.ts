import type { Group } from '@/prisma/generated/client'

export type GroupTreeNode = {
  group: Group
  depth: number
  children: GroupTreeNode[]
}

export function buildGroupHierarchy(groups: Group[]): GroupTreeNode[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const childGroupsByParentId = new Map<string, Group[]>()
  for (const group of groups) {
    if (!group.parentGroupId || !groupsById.has(group.parentGroupId)) {
      continue
    }
    childGroupsByParentId.set(group.parentGroupId, [...(childGroupsByParentId.get(group.parentGroupId) ?? []), group])
  }
  for (const childGroups of childGroupsByParentId.values()) {
    childGroups.sort(compareGroupsForDisplay)
  }

  const visitedGroupIds = new Set<string>()
  const rootGroups = groups
    .filter((group) => !group.parentGroupId || !groupsById.has(group.parentGroupId))
    .sort(compareGroupsForDisplay)
  const hierarchy = rootGroups.flatMap((group) => {
    const node = buildGroupHierarchyNode(group.id, 0, new Set())
    return node ? [node] : []
  })

  const remainingGroups = groups.toSorted(compareGroupsForDisplay)
  for (const group of remainingGroups) {
    if (visitedGroupIds.has(group.id)) {
      continue
    }
    const node = buildGroupHierarchyNode(group.id, 0, new Set())
    if (node) {
      hierarchy.push(node)
    }
  }

  return hierarchy

  function buildGroupHierarchyNode(
    groupId: string,
    depth: number,
    lineageGroupIds: Set<string>,
  ): GroupTreeNode | undefined {
    if (visitedGroupIds.has(groupId) || lineageGroupIds.has(groupId)) {
      return undefined
    }

    const group = groupsById.get(groupId)
    if (!group) {
      return undefined
    }

    visitedGroupIds.add(groupId)
    const nextLineageGroupIds = new Set(lineageGroupIds)
    nextLineageGroupIds.add(groupId)

    return {
      group,
      depth,
      children: (childGroupsByParentId.get(groupId) ?? []).flatMap((childGroup): GroupTreeNode[] => {
        const child = buildGroupHierarchyNode(childGroup.id, depth + 1, nextLineageGroupIds)
        return child ? [child] : []
      }),
    } satisfies GroupTreeNode
  }
}

export function buildGroupPathLookup(groups: Group[]) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const groupPathsById = new Map<string, string>()
  for (const group of groups) {
    const names = [group.name]
    const visitedGroupIds = new Set([group.id])
    let parentGroupId = group.parentGroupId
    while (parentGroupId) {
      const parent = groupsById.get(parentGroupId)
      if (!parent || visitedGroupIds.has(parent.id)) {
        break
      }
      names.unshift(parent.name)
      visitedGroupIds.add(parent.id)
      parentGroupId = parent.parentGroupId
    }
    groupPathsById.set(group.id, names.join(' / '))
  }
  return groupPathsById
}

export function isGroupAncestor(groups: Group[], ancestorGroupId: string, candidateChildGroupId: string) {
  if (ancestorGroupId === candidateChildGroupId) {
    return false
  }

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const visitedGroupIds = new Set<string>()
  let candidate = groupsById.get(candidateChildGroupId)
  while (candidate?.parentGroupId) {
    if (candidate.parentGroupId === ancestorGroupId) {
      return true
    }
    if (visitedGroupIds.has(candidate.parentGroupId)) {
      return false
    }
    visitedGroupIds.add(candidate.parentGroupId)
    candidate = groupsById.get(candidate.parentGroupId)
  }
  return false
}

export function compareSiblingGroupNames(firstName: string, secondName: string) {
  return normalizeGroupName(firstName).localeCompare(normalizeGroupName(secondName))
}

function compareGroupsForDisplay(first: Group, second: Group) {
  return first.name.localeCompare(second.name) || first.id.localeCompare(second.id)
}

function normalizeGroupName(value: string) {
  return value.trim().toLocaleLowerCase()
}

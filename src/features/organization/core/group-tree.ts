import type { Group } from '@/prisma/generated/client'

export type GroupTreeGroup = Pick<Group, 'id' | 'name' | 'parentGroupId'>

export type GroupTreeNode<TGroup extends GroupTreeGroup = Group> = {
  group: TGroup
  depth: number
  children: GroupTreeNode<TGroup>[]
}

export function buildGroupTree<TGroup extends GroupTreeGroup>(groups: TGroup[]): GroupTreeNode<TGroup>[] {
  const nodes = new Map<string, GroupTreeNode<TGroup>>(
    groups.map((group) => [group.id, { group, depth: 0, children: [] }]),
  )
  const roots: GroupTreeNode<TGroup>[] = []

  for (const group of groups) {
    const node = nodes.get(group.id)
    if (!node) {
      continue
    }

    const parent = group.parentGroupId ? nodes.get(group.parentGroupId) : undefined
    if (
      parent &&
      parent.group.id !== group.id &&
      !isGroupAncestor(groups, { groupId: parent.group.id, ancestorGroupId: group.id })
    ) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  assignGroupTreeDepths(roots, 0)
  sortGroupTree(roots)
  return roots
}

export function buildGroupPathLabels(groups: GroupTreeGroup[]) {
  return new Map(groups.map((group) => [group.id, formatGroupPath(groups, group)]))
}

export function formatGroupPath(groups: GroupTreeGroup[], group: GroupTreeGroup) {
  const groupsById = new Map(groups.map((candidate) => [candidate.id, candidate]))
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

  return names.join(' / ')
}

export function isGroupAncestor(groups: GroupTreeGroup[], input: { groupId: string; ancestorGroupId: string }) {
  if (input.groupId === input.ancestorGroupId) {
    return false
  }

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const visitedGroupIds = new Set([input.groupId])
  let parentGroupId = groupsById.get(input.groupId)?.parentGroupId

  while (parentGroupId) {
    if (parentGroupId === input.ancestorGroupId) {
      return true
    }
    if (visitedGroupIds.has(parentGroupId)) {
      return false
    }

    visitedGroupIds.add(parentGroupId)
    parentGroupId = groupsById.get(parentGroupId)?.parentGroupId
  }

  return false
}

export function compareGroupTreeSiblings(first: GroupTreeGroup, second: GroupTreeGroup) {
  return first.name.localeCompare(second.name) || first.id.localeCompare(second.id)
}

export function groupSiblingNamesMatch(firstName: string, secondName: string) {
  return normalizeGroupSiblingName(firstName) === normalizeGroupSiblingName(secondName)
}

function assignGroupTreeDepths<TGroup extends GroupTreeGroup>(nodes: GroupTreeNode<TGroup>[], depth: number) {
  for (const node of nodes) {
    node.depth = depth
    assignGroupTreeDepths(node.children, depth + 1)
  }
}

function sortGroupTree<TGroup extends GroupTreeGroup>(nodes: GroupTreeNode<TGroup>[]) {
  nodes.sort((first, second) => compareGroupTreeSiblings(first.group, second.group))
  for (const node of nodes) {
    sortGroupTree(node.children)
  }
}

function normalizeGroupSiblingName(value: string) {
  return value.trim().toLocaleLowerCase()
}

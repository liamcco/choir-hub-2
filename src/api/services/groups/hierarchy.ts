export type GroupHierarchyNode = {
  id: string
  parentGroupId: string | null
}

export type GroupMembershipNode = {
  groupId: string
  userId: string
}

export function getDirectMemberCounts(memberships: GroupMembershipNode[]) {
  const memberIdsByGroupId = new Map<string, Set<string>>()

  for (const membership of memberships) {
    const memberIds = memberIdsByGroupId.get(membership.groupId) ?? new Set<string>()
    memberIds.add(membership.userId)
    memberIdsByGroupId.set(membership.groupId, memberIds)
  }

  return new Map([...memberIdsByGroupId.entries()].map(([groupId, memberIds]) => [groupId, memberIds.size]))
}

export function getDescendantGroupIdsFromHierarchy(groupId: string, groups: GroupHierarchyNode[]) {
  const childIdsByGroupId = getChildIdsByGroupId(groups)
  const descendants: string[] = []
  const visitedGroupIds = new Set([groupId])
  const queue = [...(childIdsByGroupId.get(groupId) ?? [])]

  while (queue.length > 0) {
    const currentGroupId = queue.shift()

    if (!currentGroupId || visitedGroupIds.has(currentGroupId)) {
      continue
    }

    visitedGroupIds.add(currentGroupId)
    descendants.push(currentGroupId)
    queue.push(...(childIdsByGroupId.get(currentGroupId) ?? []))
  }

  return descendants
}

export function getEffectiveMemberCounts(groups: GroupHierarchyNode[], memberships: GroupMembershipNode[]) {
  const parentByGroupId = new Map(groups.map((group) => [group.id, group.parentGroupId]))
  const memberIdsByGroupId = new Map<string, Set<string>>()

  for (const membership of memberships) {
    let currentGroupId: string | null = membership.groupId
    const visitedGroupIds = new Set<string>()

    while (currentGroupId && !visitedGroupIds.has(currentGroupId)) {
      visitedGroupIds.add(currentGroupId)

      const memberIds = memberIdsByGroupId.get(currentGroupId) ?? new Set<string>()
      memberIds.add(membership.userId)
      memberIdsByGroupId.set(currentGroupId, memberIds)

      currentGroupId = parentByGroupId.get(currentGroupId) ?? null
    }
  }

  return new Map([...memberIdsByGroupId.entries()].map(([groupId, memberIds]) => [groupId, memberIds.size]))
}

function getChildIdsByGroupId(groups: GroupHierarchyNode[]) {
  const childIdsByGroupId = new Map<string, string[]>()

  for (const group of groups) {
    if (!group.parentGroupId) {
      continue
    }

    childIdsByGroupId.set(group.parentGroupId, [...(childIdsByGroupId.get(group.parentGroupId) ?? []), group.id])
  }

  return childIdsByGroupId
}

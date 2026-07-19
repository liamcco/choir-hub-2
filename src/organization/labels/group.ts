import type { Group } from '@/prisma/generated/client'

export function formatGroupPath(groups: Group[], group: Group) {
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

import type { OrganizationRecord } from '@/organization'

export function formatGroupPath(groups: OrganizationRecord<'group'>[], group: OrganizationRecord<'group'>) {
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

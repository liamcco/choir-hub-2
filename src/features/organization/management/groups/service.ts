import { type Group, listGroups as listTopologyGroups, resolveGroup } from '@/core/topology'

export function listGroups(): readonly Group[] {
  return listTopologyGroups()
}

export function getGroup(groupId: string): Group | null {
  return resolveGroup(groupId) ?? null
}

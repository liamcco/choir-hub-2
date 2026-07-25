import { type Group, getGroup as getTopologyGroup, listGroups as listTopologyGroups } from '@/core/topology'

export function listGroups(): readonly Group[] {
  return listTopologyGroups()
}

export function getGroup(groupId: string): Group | null {
  return getTopologyGroup(groupId) ?? null
}

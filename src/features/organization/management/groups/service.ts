import type { Group } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'

export async function listGroups(): Promise<Group[]> {
  const groups = await organizationService.groups.list()
  return groups
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const group = await organizationService.groups.get(groupId)
  return group
}

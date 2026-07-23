import { organizationService } from '@/features/organization'
import type { Group } from '@/prisma/generated/client'

export async function listGroups(): Promise<Group[]> {
  const groups = await organizationService.groups.list()
  return groups
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const group = await organizationService.groups.get(groupId)
  return group
}

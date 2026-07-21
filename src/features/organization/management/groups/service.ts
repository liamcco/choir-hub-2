import { organizationService } from '@/features/organization'
import type { Group } from '@/prisma/generated/client'

export async function listGroups(): Promise<Group[]> {
  const groups = await organizationService.groups.list()
  return groups
}

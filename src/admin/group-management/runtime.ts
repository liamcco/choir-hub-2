import { createGroupManagementService } from '@/admin/group-management/service'
import { createGroupStructure, createPrismaOrganizationPersistence } from '@/organization'

export async function getGroupManagementService() {
  return createGroupManagementService({
    groupStructure: createGroupStructure(createPrismaOrganizationPersistence()),
  })
}

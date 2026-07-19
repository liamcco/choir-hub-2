import { createGroupManagementService } from '@/admin/group-management/service'
import { createOrganizationDomain, createPrismaOrganizationPersistence } from '@/organization'

export async function getGroupManagementService() {
  return createGroupManagementService({
    organization: createOrganizationDomain(createPrismaOrganizationPersistence()),
  })
}

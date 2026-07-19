import { createPositionManagementService } from '@/admin/position-management/service'
import { createGroupStructure, createPositionScopeRegistry, createPrismaOrganizationPersistence } from '@/organization'

export async function getPositionManagementService() {
  const persistence = createPrismaOrganizationPersistence()
  return createPositionManagementService({
    groupStructure: createGroupStructure(persistence),
    positionScopeRegistry: createPositionScopeRegistry(persistence),
  })
}

import { headers } from 'next/headers'
import { createBetterAuthAdminGateway } from '@/admin/member-management/better-auth-gateway'
import { createPositionAssignmentManagementService } from '@/admin/position-assignment-management/service'
import {
  createGroupStructure,
  createMemberRegistry,
  createPositionAssignmentHistory,
  createPositionScopeRegistry,
  createPrismaOrganizationPersistence,
} from '@/organization'

export async function getPositionAssignmentManagementService() {
  const organizationPersistence = createPrismaOrganizationPersistence()
  return createPositionAssignmentManagementService({
    authGateway: createBetterAuthAdminGateway(await headers()),
    groupStructure: createGroupStructure(organizationPersistence),
    memberRegistry: createMemberRegistry(organizationPersistence),
    positionAssignmentHistory: createPositionAssignmentHistory(organizationPersistence),
    positionScopeRegistry: createPositionScopeRegistry(organizationPersistence),
  })
}

import { headers } from 'next/headers'
import { createGroupMembershipManagementService } from '@/admin/group-membership-management/service'
import { createBetterAuthAdminGateway } from '@/admin/member-management/better-auth-gateway'
import {
  createGroupMembershipHistory,
  createGroupStructure,
  createMemberRegistry,
  createPrismaOrganizationPersistence,
} from '@/organization'

export async function getGroupMembershipManagementService() {
  const organizationPersistence = createPrismaOrganizationPersistence()
  return createGroupMembershipManagementService({
    authGateway: createBetterAuthAdminGateway(await headers()),
    groupMembershipHistory: createGroupMembershipHistory(organizationPersistence),
    groupStructure: createGroupStructure(organizationPersistence),
    memberRegistry: createMemberRegistry(organizationPersistence),
  })
}

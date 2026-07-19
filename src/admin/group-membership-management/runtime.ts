import { headers } from 'next/headers'
import { createGroupMembershipManagementService } from '@/admin/group-membership-management/service'
import { createBetterAuthAdminGateway } from '@/admin/member-management/better-auth-gateway'
import { createOrganizationDomain, createPrismaOrganizationPersistence } from '@/organization'

export async function getGroupMembershipManagementService() {
  return createGroupMembershipManagementService({
    authGateway: createBetterAuthAdminGateway(await headers()),
    organization: createOrganizationDomain(createPrismaOrganizationPersistence()),
  })
}

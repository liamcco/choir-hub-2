import { headers } from 'next/headers'
import { createBetterAuthAdminGateway } from '@/admin/member-management/better-auth-gateway'
import { createMemberManagementService } from '@/admin/member-management/service'
import { createOrganizationDomain, createPrismaOrganizationPersistence } from '@/organization'

export async function getMemberManagementService() {
  return createMemberManagementService({
    authGateway: createBetterAuthAdminGateway(await headers()),
    memberRegistry: createOrganizationDomain(createPrismaOrganizationPersistence()),
  })
}

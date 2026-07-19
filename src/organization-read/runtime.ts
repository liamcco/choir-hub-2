import { prisma } from '@/db'
import {
  createGroupMembershipHistory,
  createGroupStructure,
  createMemberRegistry,
  createPositionAssignmentHistory,
  createPositionScopeRegistry,
  createPrismaOrganizationPersistence,
} from '@/organization'
import { createOrganizationalReadOnlyService } from '@/organization-read/service'

export async function getOrganizationalReadOnlyService() {
  const persistence = createPrismaOrganizationPersistence()
  return createOrganizationalReadOnlyService({
    authGateway: {
      listUsers: async () =>
        prisma.user.findMany({
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        }),
    },
    groupMembershipHistory: createGroupMembershipHistory(persistence),
    groupStructure: createGroupStructure(persistence),
    memberRegistry: createMemberRegistry(persistence),
    positionAssignmentHistory: createPositionAssignmentHistory(persistence),
    positionScopeRegistry: createPositionScopeRegistry(persistence),
  })
}

import { createGroupMembershipHistory } from '@/organization/group-membership-history'
import { createGroupStructure } from '@/organization/group-structure'
import { createMemberRegistry } from '@/organization/member-registry'
import { createPositionAssignmentHistory } from '@/organization/position-assignment-history'
import { createPositionScopeRegistry } from '@/organization/position-scope-registry'
import type { OrganizationDomain, OrganizationPersistence } from '@/organization/types'

export function createOrganizationDomain(persistence: OrganizationPersistence): OrganizationDomain {
  return {
    ...createGroupStructure(persistence),
    ...createMemberRegistry(persistence),
    ...createGroupMembershipHistory(persistence),
    ...createPositionScopeRegistry(persistence),
    ...createPositionAssignmentHistory(persistence),
  }
}

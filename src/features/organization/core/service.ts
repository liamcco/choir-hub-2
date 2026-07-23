import 'server-only'

import { groupMemberships } from '@/features/organization/core/group-memberships'
import { groups } from '@/features/organization/core/groups'
import { users } from '@/features/organization/core/members'
import { positionAssignments } from '@/features/organization/core/position-assignments'
import { positions } from '@/features/organization/core/positions'

export const organizationService = {
  groups,
  users,
  members: users,
  groupMemberships,
  positions,
  positionAssignments,
}

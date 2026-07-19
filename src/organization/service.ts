import 'server-only'

import { groupMemberships } from '@/organization/group-memberships'
import { groups } from '@/organization/groups'
import { members } from '@/organization/members'
import { positionAssignments } from '@/organization/position-assignments'
import { positions } from '@/organization/positions'

export const organizationService = {
  groups,
  members,
  groupMemberships,
  positions,
  positionAssignments,
}

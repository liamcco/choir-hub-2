import 'server-only'

import { groupMemberships } from '@/features/organization/core/group-memberships'
import { groups } from '@/features/organization/core/groups'
import { users } from '@/features/organization/core/members'
import { positionAssignments } from '@/features/organization/core/position-assignments'
import { positions } from '@/features/organization/core/positions'
import { committeeMembership } from './committee-membership'
import { effectiveGroupMembership } from './effective-group-membership'
import { homePlacement } from './home-placement'
import { positionAssignment } from './position-assignment'

export const organizationService = {
  groups,
  users,
  members: users,
  groupMemberships,
  positions,
  positionAssignments,
  homePlacement,
  committeeMembership,
  positionAssignment,
  effectiveGroupMembership,
}

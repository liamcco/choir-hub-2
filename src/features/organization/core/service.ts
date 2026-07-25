import 'server-only'

import { groupMemberships } from '@/features/organization/core/group-memberships'
import { users } from '@/features/organization/core/members'
import { positionAssignments } from '@/features/organization/core/position-assignments'
import { committeeMembership } from './committee-membership'
import { effectiveGroupMembership } from './effective-group-membership'
import { homePlacement } from './home-placement'
import { positionAssignment } from './position-assignment'

export const organizationService = {
  users,
  members: users,
  groupMemberships,
  positionAssignments,
  homePlacement,
  committeeMembership,
  positionAssignment,
  effectiveGroupMembership,
}

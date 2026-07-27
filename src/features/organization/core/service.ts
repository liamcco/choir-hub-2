import 'server-only'

import { groupMembership } from '@/features/organization/core/group-membership'
import { users } from '@/features/organization/core/members'
import { effectiveGroupMembership } from './effective-group-membership'
import { homePlacement } from './home-placement'
import { positionAssignment } from './position-assignment'

export const organizationService = {
  users,
  members: users,
  groupMembership,
  positionAssignment,
  homePlacement,
  effectiveGroupMembership,
}

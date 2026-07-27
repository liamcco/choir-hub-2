import 'server-only'

import { groupMembership } from '@/features/organization/core/group-membership'
import { users } from '@/features/organization/core/users'
import { voiceCapability } from '@/features/organization/core/voice-capability'
import { effectiveGroupMembership } from './effective-group-membership'
import { homePlacement } from './home-placement'
import { positionAssignment } from './position-assignment'

export const organizationService = {
  users,
  groupMembership,
  positionAssignment,
  voiceCapability,
  homePlacement,
  effectiveGroupMembership,
}

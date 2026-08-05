/** Focused Group Membership reads and server-side adapters for management workflows. */
import { listGroups } from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserDisplayOptions, type UserDisplayOption } from '@/features/organization/core/labels'
import { type GroupMembershipPeriod, resolveGroupMembershipDetails } from './periods'

export type { GroupMembershipPeriod } from './periods'
export { resolveGroupMembershipDetails } from './periods'

/** Reads Users as stable, consistently formatted options for membership forms. */
export async function listGroupMembershipUsers(): Promise<UserDisplayOption[]> {
  return buildUserDisplayOptions(await organizationService.users.list())
}

/** Reads dated Group Membership records with their canonical Group and User details. */
export async function listGroupMembershipPeriods(): Promise<GroupMembershipPeriod[]> {
  const [groups, users, memberships] = await Promise.all([
    listGroups(),
    organizationService.users.list(),
    organizationService.groupMembership.list(),
  ])
  return resolveGroupMembershipDetails(memberships, groups, users)
}

/** Reads ended Group Membership records with their canonical Group and User details. */
export async function listPreviousGroupMembershipPeriods(): Promise<GroupMembershipPeriod[]> {
  const [groups, users, memberships] = await Promise.all([
    listGroups(),
    organizationService.users.list(),
    organizationService.groupMembership.listPrevious(),
  ])
  return resolveGroupMembershipDetails(memberships, groups, users)
}

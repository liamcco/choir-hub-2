/** Focused Group Membership reads and server-side adapters for management workflows. */
import { type Group, listGroups } from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserLabels, type UserLabel } from '@/features/organization/core/labels'
import { type GroupMembershipPeriod, resolveGroupMembershipDetails } from './periods'

export type { GroupMembershipPeriod, GroupMembershipPeriodsByState } from './periods'
export { resolveGroupMembershipDetails, splitGroupMembershipPeriods } from './periods'

/** Reads the active Groups available for new Group Membership records. */
export function listGroupMembershipGroups(): readonly Group[] {
  return listGroups()
}

/** Reads Users as stable, consistently formatted options for membership forms. */
export async function listGroupMembershipUsers(): Promise<UserLabel[]> {
  return buildUserLabels(await organizationService.users.list())
}

/** Reads dated Group Membership records with their canonical Group and User details. */
export async function listGroupMembershipPeriods(): Promise<GroupMembershipPeriod[]> {
  const [groups, users, memberships] = await Promise.all([
    Promise.resolve(listGroupMembershipGroups()),
    organizationService.users.list(),
    organizationService.groupMembership.list(),
  ])
  return resolveGroupMembershipDetails(memberships, groups, users)
}

/** Reads ended Group Membership records with their canonical Group and User details. */
export async function listPreviousGroupMembershipPeriods(): Promise<GroupMembershipPeriod[]> {
  const [groups, users, memberships] = await Promise.all([
    Promise.resolve(listGroupMembershipGroups()),
    organizationService.users.list(),
    organizationService.groupMembership.listPrevious(),
  ])
  return resolveGroupMembershipDetails(memberships, groups, users)
}

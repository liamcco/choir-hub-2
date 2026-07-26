/** Focused Group Membership reads and server-side adapters for management workflows. */
import { type Group, listGroups } from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserLabels, type UserLabel } from '@/features/organization/core/labels'
import {
  categorizeGroupMembershipPeriods,
  type GroupMembershipPeriod,
  type GroupMembershipPeriodsByDate,
  resolveGroupMembershipDetails,
} from './periods'

export type { GroupMembershipPeriod, GroupMembershipPeriodsByDate } from './periods'
export { categorizeGroupMembershipPeriods, resolveGroupMembershipDetails } from './periods'

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
    organizationService.groupMemberships.list(),
  ])
  return resolveGroupMembershipDetails(memberships, groups, users)
}

/** Reads and categorizes all Group Memberships for one point in time. */
export async function listGroupMembershipPeriodsByDate(input?: { at?: Date }): Promise<GroupMembershipPeriodsByDate> {
  const periods = await listGroupMembershipPeriods()
  return categorizeGroupMembershipPeriods(periods, input?.at ?? new Date())
}

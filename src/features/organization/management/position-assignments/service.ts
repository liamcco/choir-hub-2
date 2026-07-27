/** Focused Position Assignment reads and server-side adapters for management workflows. */
import { listPositions } from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserLabels, type UserLabel } from '@/features/organization/core/labels'
import {
  categorizePositionAssignmentPeriods,
  type PositionAssignmentPeriod,
  type PositionAssignmentPeriodsByDate,
  resolvePositionAssignmentDetails,
} from './periods'

export { listPositionAssignmentOptions } from './options'
export type { PositionAssignmentPeriod, PositionAssignmentPeriodsByDate } from './periods'
export { categorizePositionAssignmentPeriods, resolvePositionAssignmentDetails } from './periods'

/** Reads Users as stable, consistently formatted options for assignment forms. */
export async function listPositionAssignmentUsers(): Promise<UserLabel[]> {
  return buildUserLabels(await organizationService.users.list())
}

/** Reads dated Position Assignments with their canonical Position and User details. */
export async function listPositionAssignmentPeriods(): Promise<PositionAssignmentPeriod[]> {
  const [users, assignments] = await Promise.all([
    organizationService.users.list(),
    organizationService.positionAssignment.list(),
  ])
  return resolvePositionAssignmentDetails(assignments, listPositions(), users)
}

/** Reads and categorizes all Position Assignments for one point in time. */
export async function listPositionAssignmentPeriodsByDate(input?: {
  at?: Date
}): Promise<PositionAssignmentPeriodsByDate> {
  const periods = await listPositionAssignmentPeriods()
  return categorizePositionAssignmentPeriods(periods, input?.at ?? new Date())
}

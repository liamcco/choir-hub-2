/** Focused Position Assignment reads and server-side adapters for management workflows. */
import { listPositions } from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserDisplayOptions, type UserDisplayOption } from '@/features/organization/core/labels'
import { type PositionAssignmentPeriod, resolvePositionAssignmentDetails } from './periods'

export { listPositionAssignmentOptions } from './options'
export type { PositionAssignmentPeriod } from './periods'
export { resolvePositionAssignmentDetails } from './periods'

/** Reads Users as stable, consistently formatted options for assignment forms. */
export async function listPositionAssignmentUsers(): Promise<UserDisplayOption[]> {
  return buildUserDisplayOptions(await organizationService.users.list())
}

/** Reads dated Position Assignments with their canonical Position and User details. */
export async function listPositionAssignmentPeriods(): Promise<PositionAssignmentPeriod[]> {
  const [users, assignments] = await Promise.all([
    organizationService.users.list(),
    organizationService.positionAssignment.list(),
  ])
  return resolvePositionAssignmentDetails(assignments, listPositions(), users)
}

/** Reads ended Position Assignments with their canonical Position and User details. */
export async function listPreviousPositionAssignmentPeriods(): Promise<PositionAssignmentPeriod[]> {
  const [users, assignments] = await Promise.all([
    organizationService.users.list(),
    organizationService.positionAssignment.listPrevious(),
  ])
  return resolvePositionAssignmentDetails(assignments, listPositions(), users)
}

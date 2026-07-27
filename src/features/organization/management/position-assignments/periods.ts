/** Pure read-model transformations for dated Position Assignment relationships. */
import type { Position } from '@/core/topology'
import type { PositionAssignment, User } from '@/drizzle/schema'
import { buildUserDisplayOptionMap } from '@/features/organization/core/labels'
import { listPositionAssignmentOptions } from './service'

export type PositionAssignmentPeriod = PositionAssignment & {
  position: Position
  user: User
  positionLabel: string
  positionScopeLabel: string
  userLabel: string
  userDetail: string
}

/** Resolves persisted IDs into domain objects and fails explicitly on invalid references. */
export function resolvePositionAssignmentDetails(
  assignments: readonly PositionAssignment[],
  positions: readonly Position[],
  users: readonly User[],
): PositionAssignmentPeriod[] {
  const positionsById = new Map<string, Position>(positions.map((position) => [position.id, position]))
  const usersById = new Map(users.map((user) => [user.id, user]))
  const positionOptionsById = new Map<string, ReturnType<typeof listPositionAssignmentOptions>[number]>(
    listPositionAssignmentOptions().map((option) => [option.position.id, option]),
  )
  const userDisplayOptionsById = buildUserDisplayOptionMap(users)
  return assignments.map((assignment) => {
    const position = positionsById.get(assignment.positionId)
    const user = usersById.get(assignment.userId)
    const positionOption = positionOptionsById.get(assignment.positionId)
    const userOption = userDisplayOptionsById.get(assignment.userId)
    if (!position || !user || !positionOption || !userOption) {
      throw new Error(
        `Invalid Position Assignment ${assignment.id}: ${!position ? `unknown Position ${assignment.positionId}` : `unknown User ${assignment.userId}`}.`,
      )
    }
    return {
      ...assignment,
      position,
      user,
      positionLabel: positionOption.label,
      positionScopeLabel: positionOption.positionScopeLabel,
      userLabel: userOption.label,
      userDetail: userOption.detail,
    }
  })
}

import { listPositions } from '@/core/topology'
import { formatPositionLabel, formatPositionScopeLabel } from '@/features/organization/core/labels'

/** Reads active Positions as consistently formatted options for assignment forms. */
export function listPositionAssignmentOptions() {
  return listPositions().map((position) => {
    const positionScopeLabel = formatPositionScopeLabel(position.scopes)
    return { position, label: formatPositionLabel(position.name, positionScopeLabel), positionScopeLabel }
  })
}

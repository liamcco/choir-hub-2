import 'server-only'

import {
  listChoirs,
  listGroups,
  listPositions,
  listSections,
  type Position,
  type PositionScope,
  resolvePosition,
  TopologyScopeType,
  topology,
} from '@/core/topology'
import { organizationService } from '@/features/organization'
import { buildUserLabels, formatPositionScopeLabel } from '@/features/organization/core/labels'
import { getPositionCollectionGroup } from './position-collection-group'

async function listCollection() {
  const assignments = await organizationService.positionAssignment.list()
  const users = await organizationService.users.list()
  const groups = listGroups()
  const choirs = listChoirs()
  const sections = listSections()
  const labels = new Map(buildUserLabels(users).map((option) => [option.user.id, option.label]))
  return listPositions()
    .map((position) => {
      const currentAssignment = assignments.find((assignment) => assignment.positionId === position.id)
      return {
        id: position.id,
        name: position.name,
        group: getPositionCollectionGroup(position.scopes, groups, choirs, sections),
        scopeLabel: formatPositionScopeLabel(position.scopes),
        currentHolder: currentAssignment ? (labels.get(currentAssignment.userId) ?? 'Unknown User') : null,
        heldSince: currentAssignment?.startsAt ?? null,
      }
    })
    .sort(
      (a, b) => a.name.localeCompare(b.name) || a.scopeLabel.localeCompare(b.scopeLabel) || a.id.localeCompare(b.id),
    )
}

async function getDetail(positionId: string) {
  const [assignments, previousAssignments, users, memberships, placements] = await Promise.all([
    organizationService.positionAssignment.list({ positionId }),
    organizationService.positionAssignment.listPrevious({ positionId }),
    organizationService.users.list(),
    organizationService.homePlacement.listChoirMemberships(),
    organizationService.homePlacement.listSectionPlacements(),
  ])
  const position = resolvePosition(positionId)
  if (!position) return null
  const groups = topology.groups
  const choirs = topology.choirs
  const sections = topology.sections
  const membersById = new Map(buildUserLabels(users).map((option) => [option.user.id, option]))
  const assignmentViews = assignments.flatMap((assignment) => {
    const member = membersById.get(assignment.userId)
    return member ? [{ ...assignment, userLabel: member.label, userDetail: member.detail }] : []
  })
  const compare = (a: (typeof assignmentViews)[number], b: (typeof assignmentViews)[number]) =>
    a.userLabel.localeCompare(b.userLabel) || a.startsAt.getTime() - b.startsAt.getTime() || a.id.localeCompare(b.id)
  return {
    position,
    groups,
    choirs,
    sections,
    positionScopes: position.scopes,
    scopeLabel: formatPositionScopeLabel(position.scopes),
    users: [...membersById.values()]
      .filter((member) => isEligible(member.user.id, position, position.scopes, memberships, placements))
      .sort((a, b) => a.label.localeCompare(b.label)),
    currentAssignments: assignmentViews.sort(compare),
    historicalAssignments: previousAssignments
      .flatMap((assignment) => {
        const member = membersById.get(assignment.userId)
        return member ? [{ ...assignment, userLabel: member.label, userDetail: member.detail }] : []
      })
      .sort((a, b) => (b.endsAt?.getTime() ?? 0) - (a.endsAt?.getTime() ?? 0) || compare(a, b)),
  }
}

function isEligible(
  userId: string,
  position: Pick<Position, 'name'>,
  scopes: readonly PositionScope[],
  memberships: Array<{ userId: string; choirId: string; startsAt: Date; endsAt: Date | null }>,
  placements: Array<{ userId: string; sectionId: string; startsAt: Date; endsAt: Date | null }>,
) {
  if (position.name === 'Conductor') return true
  const sectionScopes = scopes.filter((scope) => scope.type === TopologyScopeType.SECTION)
  if (sectionScopes.length)
    return placements.some(
      (placement) =>
        placement.userId === userId && sectionScopes.some((scope) => scope.sectionId === placement.sectionId),
    )
  const choirScopes = scopes.filter((scope) => scope.type === TopologyScopeType.CHOIR)
  if (choirScopes.length && (position.name === 'Master of Concerts' || position.name === 'Master of Gigs'))
    return memberships.some(
      (membership) => membership.userId === userId && choirScopes.some((scope) => scope.choirId === membership.choirId),
    )
  return true
}

export const listPositionCollection = listCollection
export const getPositionDetail = getDetail

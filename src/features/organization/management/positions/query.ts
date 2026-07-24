import 'server-only'

import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildUserLabels, formatPositionScopeLabel } from '@/features/organization/core/labels'
import { getPositionCollectionGroup } from './position-collection-group'

async function loadReferences() {
  const [groups, choirs, sections] = await Promise.all([
    organizationService.groups.list(),
    organizationService.positions.listChoirs(),
    organizationService.positions.listSections(),
  ])
  return { groups, choirs, sections }
}

async function listCollection(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [{ groups, choirs, sections }, positions, scopes, assignments, users] = await Promise.all([
    loadReferences(),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ at }),
    organizationService.users.list(),
  ])
  const labels = new Map(buildUserLabels(users).map((option) => [option.user.id, option.label]))
  return positions
    .map((position) => {
      const positionScopes = scopes.filter((scope) => scope.positionId === position.id)
      const currentAssignment = assignments.find(
        (assignment) => assignment.positionId === position.id && isCurrentDatedPeriod(assignment, at),
      )
      return {
        id: position.id,
        name: position.name,
        group: getPositionCollectionGroup(positionScopes, groups, choirs, sections),
        scopeLabel: formatPositionScopeLabel(positionScopes as never, { choirs, sections, groups }),
        currentHolder: currentAssignment ? (labels.get(currentAssignment.userId) ?? 'Unknown User') : null,
        heldSince: currentAssignment?.startsAt ?? null,
      }
    })
    .sort(
      (a, b) => a.name.localeCompare(b.name) || a.scopeLabel.localeCompare(b.scopeLabel) || a.id.localeCompare(b.id),
    )
}

async function getDetail(positionId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [{ groups, choirs, sections }, positions, scopes, assignments, users, memberships, placements] =
    await Promise.all([
      loadReferences(),
      organizationService.positions.list(),
      organizationService.positions.listScopes(),
      organizationService.positionAssignments.list({ positionId }),
      organizationService.users.list(),
      organizationService.homePlacement.listChoirMemberships(),
      organizationService.homePlacement.listSectionPlacements(),
    ])
  const position = positions.find((candidate) => candidate.id === positionId)
  if (!position) return null
  const positionScopes = scopes.filter((scope) => scope.positionId === positionId)
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
    positionScopes,
    scopeLabel: formatPositionScopeLabel(positionScopes as never, { choirs, sections, groups }),
    users: [...membersById.values()]
      .filter((member) => isEligible(member.user.id, position, positionScopes, memberships, placements, at))
      .sort((a, b) => a.label.localeCompare(b.label)),
    currentAssignments: assignmentViews.filter((a) => isCurrentDatedPeriod(a, at)).sort(compare),
    historicalAssignments: assignmentViews
      .filter((a) => isHistoricalDatedPeriod(a, at))
      .sort((a, b) => (b.endsAt?.getTime() ?? 0) - (a.endsAt?.getTime() ?? 0) || compare(a, b)),
  }
}

function isEligible(
  userId: string,
  position: { name: string },
  scopes: Array<{ targetType: string; choirId: string | null; sectionId: string | null }>,
  memberships: Array<{ userId: string; choirId: string; startsAt: Date; endsAt: Date | null }>,
  placements: Array<{ userId: string; sectionId: string; startsAt: Date; endsAt: Date | null }>,
  at: Date,
) {
  const current = (period: { startsAt: Date; endsAt: Date | null }) =>
    period.startsAt <= at && (!period.endsAt || period.endsAt > at)
  if (position.name === 'Conductor') return true
  const sectionScopes = scopes.filter((scope) => scope.targetType === 'section' && scope.sectionId)
  if (sectionScopes.length)
    return placements.some(
      (placement) =>
        placement.userId === userId &&
        current(placement) &&
        sectionScopes.some((scope) => scope.sectionId === placement.sectionId),
    )
  const choirScopes = scopes.filter((scope) => scope.targetType === 'choir' && scope.choirId)
  if (choirScopes.length && (position.name === 'Master of Concerts' || position.name === 'Master of Gigs'))
    return memberships.some(
      (membership) =>
        membership.userId === userId &&
        current(membership) &&
        choirScopes.some((scope) => scope.choirId === membership.choirId),
    )
  return true
}

export const listPositionCollection = listCollection
export const getPositionDetail = getDetail

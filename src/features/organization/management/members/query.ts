import 'server-only'

import { headers } from 'next/headers'
import { connection } from 'next/server'
import { auth } from '@/core/auth/auth'
import { db } from '@/core/db'
import { choir, section } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildUserLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'

async function listCollection(input?: { at?: Date }) {
  await connection()
  const at = input?.at ?? new Date()
  const [users, choirMemberships, placements, choirs, sections] = await Promise.all([
    organizationService.users.list(),
    organizationService.homePlacement.listChoirMemberships(),
    organizationService.homePlacement.listSectionPlacements(),
    db.select().from(choir),
    db.select().from(section),
  ])
  const choirById = new Map(choirs.map((item) => [item.id, item]))
  const sectionById = new Map(sections.map((item) => [item.id, item]))

  return buildUserLabels(users)
    .map(({ user, label }) => {
      return {
        id: user.id,
        name: label,
        homeChoir: choirById.get(choirMemberships.find((m) => m.userId === user.id && isCurrentDatedPeriod(m, at))?.choirId ?? '')?.name ?? null,
        section: sectionById.get(placements.find((p) => p.userId === user.id && isCurrentDatedPeriod(p, at))?.sectionId ?? '')?.name ?? null,
        status: user.status,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

async function getDetail(userId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const requestHeaders = await headers()
  const [account, user, groups, memberships, positions, scopes, assignments, choirMemberships, placements, choirs, sections] = await Promise.all([
    auth.api.getUser({ headers: requestHeaders, query: { id: userId } }),
    organizationService.users.find({ userId }),
    organizationService.groups.list(),
    organizationService.committeeMembership.list({ userId }),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ userId }),
    organizationService.homePlacement.listChoirMemberships({ userId }),
    organizationService.homePlacement.listSectionPlacements({ userId }),
    db.select().from(choir),
    db.select().from(section),
  ])
  if (!account || !user) return null

  const choirById = new Map(choirs.map((item) => [item.id, item]))
  const sectionById = new Map(sections.map((item) => [item.id, item]))
  const currentChoir = choirMemberships.find((item) => isCurrentDatedPeriod(item, at))
  const currentSection = placements.find((item) => isCurrentDatedPeriod(item, at))

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const positionsById = new Map(positions.map((position) => [position.id, position]))
  const scopeGroupsByPositionId = new Map<string, typeof groups>()
  for (const scope of scopes) {
    const group = scope.groupId ? groupsById.get(scope.groupId) : undefined
    if (!group) continue
    const scopeGroups = scopeGroupsByPositionId.get(scope.positionId) ?? []
    scopeGroups.push(group)
    scopeGroupsByPositionId.set(scope.positionId, scopeGroups)
  }

  const membershipViews = memberships.flatMap((membership) => {
    const group = groupsById.get(membership.groupId)
    return group
      ? [
          {
            id: membership.id,
            groupId: group.id,
            groupName: formatGroupPath(groups, group),
            groupKind: group.kind,
            startsAt: membership.startsAt,
            endsAt: membership.endsAt ?? undefined,
          },
        ]
      : []
  })
  const assignmentViews = assignments.flatMap((assignment) => {
    const position = positionsById.get(assignment.positionId)
    if (!position) return []
    const scopeGroups = (scopeGroupsByPositionId.get(position.id) ?? []).sort((first, second) =>
      formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)),
    )
    return [
      {
        id: assignment.id,
        positionId: position.id,
        positionName: position.name,
        scopeLabel: formatPositionScopeLabel(groups, scopeGroups),
        startsAt: assignment.startsAt,
        endsAt: assignment.endsAt ?? undefined,
      },
    ]
  })

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    status: user.status,
    homePlacement: {
      choir: currentChoir ? { id: currentChoir.choirId, name: choirById.get(currentChoir.choirId)?.name ?? 'Unknown Choir' } : null,
      section: currentSection ? { id: currentSection.sectionId, name: sectionById.get(currentSection.sectionId)?.name ?? 'Unknown Section' } : null,
    },
    choirMembershipHistory: choirMemberships.map((item) => ({ ...item, choirName: choirById.get(item.choirId)?.name ?? 'Unknown Choir' })),
    sectionPlacementHistory: placements.map((item) => ({ ...item, sectionName: sectionById.get(item.sectionId)?.name ?? 'Unknown Section' })),
    accessState: account.banned ? ('disabled' as const) : ('enabled' as const),
    accessRole: account.role || 'user',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    groups: groups
      .map((group) => ({ id: group.id, name: formatGroupPath(groups, group) }))
      .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id)),
    positions: positions
      .map((position) => {
        const scopeGroups = (scopeGroupsByPositionId.get(position.id) ?? []).sort((first, second) =>
          formatGroupPath(groups, first).localeCompare(formatGroupPath(groups, second)),
        )
        return { id: position.id, label: `${position.name} · ${formatPositionScopeLabel(groups, scopeGroups)}` }
      })
      .sort((first, second) => first.label.localeCompare(second.label) || first.id.localeCompare(second.id)),
    currentMemberships: membershipViews
      .filter((membership) => isCurrentDatedPeriod({ ...membership, endsAt: membership.endsAt ?? null }, at))
      .sort((first, second) => first.groupName.localeCompare(second.groupName) || first.id.localeCompare(second.id)),
    historicalMemberships: membershipViews
      .filter((membership) => isHistoricalDatedPeriod({ ...membership, endsAt: membership.endsAt ?? null }, at))
      .sort(compareEndedPeriods),
    currentAssignments: assignmentViews
      .filter((assignment) => isCurrentDatedPeriod({ ...assignment, endsAt: assignment.endsAt ?? null }, at))
      .sort(
        (first, second) =>
          first.positionName.localeCompare(second.positionName) ||
          first.scopeLabel.localeCompare(second.scopeLabel) ||
          first.id.localeCompare(second.id),
      ),
    historicalAssignments: assignmentViews
      .filter((assignment) => isHistoricalDatedPeriod({ ...assignment, endsAt: assignment.endsAt ?? null }, at))
      .sort(compareEndedPeriods),
  }
}

export const listMemberCollection = listCollection
export const getMemberDetail = getDetail

function compareEndedPeriods(first: { id: string; endsAt?: Date }, second: { id: string; endsAt?: Date }) {
  return (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || first.id.localeCompare(second.id)
}

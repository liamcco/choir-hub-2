import 'server-only'

import { headers } from 'next/headers'
import { connection } from 'next/server'
import { auth } from '@/core/auth/auth'
import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod, isHistoricalDatedPeriod } from '@/features/organization/core/dated-history'
import { buildUserLabels, formatGroupPath, formatPositionScopeLabel } from '@/features/organization/core/labels'
import { GroupKind } from '@/prisma/generated/client'

async function listCollection(input?: { at?: Date }) {
  await connection()
  const at = input?.at ?? new Date()
  const [users, groups, memberships] = await Promise.all([
    organizationService.users.list(),
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ at }),
  ])
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const currentGroupsByUserId = new Map<string, typeof groups>()
  for (const membership of memberships) {
    const group = groupsById.get(membership.groupId)
    if (!group) continue
    const userGroups = currentGroupsByUserId.get(membership.userId) ?? []
    userGroups.push(group)
    currentGroupsByUserId.set(membership.userId, userGroups)
  }

  return buildUserLabels(users)
    .map(({ user, label }) => {
      const userGroups = currentGroupsByUserId.get(user.id) ?? []
      return {
        id: user.id,
        name: label,
        choirs: userGroups
          .filter((group) => group.kind === GroupKind.CHOIR)
          .sort(compareNamedEntities)
          .map((group) => group.name),
        voices: userGroups
          .filter((group) => group.kind === GroupKind.SECTION)
          .sort(compareNamedEntities)
          .map((group) => group.name),
        status: user.status,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

async function getDetail(userId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const requestHeaders = await headers()
  const [account, user, groups, memberships, positions, scopes, assignments] = await Promise.all([
    auth.api.getUser({ headers: requestHeaders, query: { id: userId } }),
    organizationService.users.find({ userId }),
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ userId }),
    organizationService.positions.list(),
    organizationService.positions.listScopes(),
    organizationService.positionAssignments.list({ userId }),
  ])
  if (!account || !user) return null

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const positionsById = new Map(positions.map((position) => [position.id, position]))
  const scopeGroupsByPositionId = new Map<string, typeof groups>()
  for (const scope of scopes) {
    const group = groupsById.get(scope.groupId)
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

function compareNamedEntities(first: { id: string; name: string }, second: { id: string; name: string }) {
  return first.name.localeCompare(second.name) || first.id.localeCompare(second.id)
}

function compareEndedPeriods(first: { id: string; endsAt?: Date }, second: { id: string; endsAt?: Date }) {
  return (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || first.id.localeCompare(second.id)
}

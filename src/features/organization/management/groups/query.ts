import 'server-only'

import { connection } from 'next/server'
import { getChoir, getGroup, listGroups, topology } from '@/core/topology'
import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildUserLabels } from '@/features/organization/core/labels'

async function listGroupStructure(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [currentMemberships] = await Promise.all([organizationService.effectiveGroupMembership.list({ at })])
  const memberIds = new Map<string, Set<string>>()
  for (const membership of currentMemberships) {
    let memberIdsForGroup = memberIds.get(membership.groupId)
    if (!memberIdsForGroup) {
      memberIdsForGroup = new Set()
      memberIds.set(membership.groupId, memberIdsForGroup)
    }
    memberIdsForGroup.add(membership.userId)
  }

  return listGroups()
    .map((group) => ({
      id: group.id,
      name: group.name,
      scope:
        group.scope.type === 'csk'
          ? 'CSK'
          : (getChoir(group.scope.choirId)?.shortName ?? group.scope.choirId.toUpperCase()),
      memberCount: memberIds.get(group.id)?.size ?? 0,
    }))
    .sort(
      (first, second) =>
        ['CSK', 'KK', 'MK', 'DK'].indexOf(first.scope) - ['CSK', 'KK', 'MK', 'DK'].indexOf(second.scope) ||
        first.name.localeCompare(second.name) ||
        first.id.localeCompare(second.id),
    )
}

async function getGroupDetail(groupId: string, input?: { at?: Date }) {
  await connection()
  const at = input?.at ?? new Date()
  const [memberships, users, positions] = await Promise.all([
    organizationService.effectiveGroupMembership.list({ groupId }),
    organizationService.users.list(),
    Promise.resolve(topology.positions),
  ])
  const group = getGroup(groupId)
  if (!group) return null

  const memberOptions = buildUserLabels(users).sort(
    (first, second) => first.label.localeCompare(second.label) || first.user.id.localeCompare(second.user.id),
  )
  const memberOptionsById = new Map(memberOptions.map((option) => [option.user.id, option]))
  const positionsById = new Map<string, string>(positions.map((position) => [position.id, position.name]))
  const membershipViews = memberships.flatMap((membership) => {
    const option = memberOptionsById.get(membership.userId)
    return option
      ? [
          {
            ...membership,
            id: `${membership.groupId}:${membership.userId}:${membership.startsAt.toISOString()}`,
            userLabel: option.label,
            userDetail: option.detail,
            sourceLabels: membership.sources.map((source) =>
              source.type === 'explicit'
                ? 'Explicit membership'
                : (positionsById.get(source.positionId ?? '') ?? 'Position assignment'),
            ),
          },
        ]
      : []
  })

  return {
    ...group,
    users: memberOptions,
    currentMemberships: membershipViews
      .filter((membership) => isCurrentDatedPeriod(membership, at))
      .sort(compareMemberships),
    scheduledMemberships: membershipViews
      .filter((membership) => isScheduledDatedPeriod(membership, at))
      .sort(compareMemberships),
    historicalMemberships: membershipViews
      .filter((membership) => isHistoricalDatedPeriod(membership, at))
      .sort(
        (first, second) =>
          (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || compareMemberships(first, second),
      ),
  }
}

export const listGroupCollection = listGroupStructure
export { getGroupDetail }

function compareMemberships(
  first: { userId: string; userLabel: string; startsAt: Date },
  second: { userId: string; userLabel: string; startsAt: Date },
) {
  return (
    first.userLabel.localeCompare(second.userLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.userId.localeCompare(second.userId)
  )
}

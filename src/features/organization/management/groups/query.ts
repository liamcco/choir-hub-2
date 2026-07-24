import 'server-only'

import { db } from '@/core/db'
import { choir } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildUserLabels } from '@/features/organization/core/labels'

async function listGroupStructure(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, currentMemberships, choirs] = await Promise.all([
    organizationService.groups.list(),
    organizationService.effectiveGroupMembership.list({ at }),
    db.select({ id: choir.id, shortName: choir.shortName }).from(choir),
  ])
  const choirNames = new Map(choirs.map((choir) => [choir.id, choir.shortName]))
  const memberIds = new Map<string, Set<string>>()
  for (const membership of currentMemberships) {
    let memberIdsForGroup = memberIds.get(membership.groupId)
    if (!memberIdsForGroup) {
      memberIdsForGroup = new Set()
      memberIds.set(membership.groupId, memberIdsForGroup)
    }
    memberIdsForGroup.add(membership.userId)
  }

  return groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      scope: group.scopeType === 'csk' ? 'CSK' : (choirNames.get(group.choirId ?? '') ?? group.scopeKey.toUpperCase()),
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
  const at = input?.at ?? new Date()
  const [groups, memberships, users, positions] = await Promise.all([
    organizationService.groups.list(),
    organizationService.effectiveGroupMembership.list({ groupId }),
    organizationService.users.list(),
    organizationService.positions.list(),
  ])
  const group = groups.find((candidate) => candidate.id === groupId)
  if (!group) return null

  const memberOptions = buildUserLabels(users).sort(
    (first, second) => first.label.localeCompare(second.label) || first.user.id.localeCompare(second.user.id),
  )
  const memberOptionsById = new Map(memberOptions.map((option) => [option.user.id, option]))
  const positionsById = new Map(positions.map((position) => [position.id, position.name]))
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

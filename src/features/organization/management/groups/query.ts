import 'server-only'

import {
  type GroupId,
  getChoir,
  listChoirsInDisplayOrder,
  listGroups,
  resolveGroup,
  TOPOLOGY_SCOPE_TYPES,
  topology,
} from '@/core/topology'
import { organizationService } from '@/features/organization'
import type { EffectiveGroupMembership } from '@/features/organization/core/effective-group-membership'
import { buildUserDisplayOptions, type UserDisplayOption } from '@/features/organization/core/labels'

async function listGroupStructure() {
  const currentMemberships = await organizationService.effectiveGroupMembership.list()
  const memberIds = new Map<string, Set<string>>()
  for (const membership of currentMemberships) {
    let memberIdsForGroup = memberIds.get(membership.groupId)
    if (!memberIdsForGroup) {
      memberIdsForGroup = new Set()
      memberIds.set(membership.groupId, memberIdsForGroup)
    }
    memberIdsForGroup.add(membership.userId)
  }

  const scopeOrder = ['CSK', ...listChoirsInDisplayOrder().map((choir) => choir.shortName)]
  return listGroups()
    .map((group) => ({
      id: group.id,
      name: group.name,
      scope:
        group.scope.type === TOPOLOGY_SCOPE_TYPES.CSK
          ? 'CSK'
          : (getChoir(group.scope.choirId)?.shortName ?? group.scope.choirId.toUpperCase()),
      memberCount: memberIds.get(group.id)?.size ?? 0,
    }))
    .sort(
      (first, second) =>
        scopeOrder.indexOf(first.scope) - scopeOrder.indexOf(second.scope) ||
        first.name.localeCompare(second.name) ||
        first.id.localeCompare(second.id),
    )
}

async function getGroupDetail(groupId: string) {
  const [memberships, previousMemberships, users, positions] = await Promise.all([
    organizationService.effectiveGroupMembership.list({ groupId }),
    organizationService.effectiveGroupMembership.listPrevious({ groupId }),
    organizationService.users.list(),
    Promise.resolve(topology.positions),
  ])
  const group = resolveGroup(groupId)
  if (!group) return null

  const userDisplayOptions = buildUserDisplayOptions(users).sort(
    (first, second) => first.label.localeCompare(second.label) || first.user.id.localeCompare(second.user.id),
  )
  const userDisplayOptionsById = new Map(userDisplayOptions.map((option) => [option.user.id, option]))
  const positionsById = new Map<string, string>(positions.map((position) => [position.id, position.name]))
  const membershipViews = memberships.flatMap((membership) =>
    mapMembershipView(membership, group.id, userDisplayOptionsById, positionsById),
  )

  return {
    ...group,
    users: userDisplayOptions,
    currentMemberships: membershipViews.sort(compareMemberships),
    historicalMemberships: previousMemberships
      .flatMap((membership) => mapMembershipView(membership, group.id, userDisplayOptionsById, positionsById))
      .sort(
        (first, second) =>
          (second.endsAt?.getTime() ?? 0) - (first.endsAt?.getTime() ?? 0) || compareMemberships(first, second),
      ),
  }
}

function mapMembershipView(
  membership: EffectiveGroupMembership,
  groupId: GroupId,
  userDisplayOptionsById: ReadonlyMap<string, UserDisplayOption>,
  positionsById: ReadonlyMap<string, string>,
) {
  const option = userDisplayOptionsById.get(membership.userId)
  return option
    ? [
        {
          ...membership,
          groupId,
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

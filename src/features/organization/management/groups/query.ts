import 'server-only'

import { organizationService } from '@/features/organization'
import {
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
} from '@/features/organization/core/dated-history'
import { buildMemberLabels } from '@/features/organization/core/labels'

async function listCollection(input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, currentMemberships] = await Promise.all([
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ at }),
  ])
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const directMemberCountByGroupId = new Map<string, number>()

  for (const membership of currentMemberships) {
    directMemberCountByGroupId.set(membership.groupId, (directMemberCountByGroupId.get(membership.groupId) ?? 0) + 1)
  }

  return groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      kind: group.kind,
      parentName: group.parentGroupId ? (groupsById.get(group.parentGroupId)?.name ?? null) : null,
      directMemberCount: directMemberCountByGroupId.get(group.id) ?? 0,
    }))
    .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

async function getDetail(groupId: string, input?: { at?: Date }) {
  const at = input?.at ?? new Date()
  const [groups, memberships, members, identities] = await Promise.all([
    organizationService.groups.list(),
    organizationService.groupMemberships.list({ groupId }),
    organizationService.members.list(),
    organizationService.members.listIdentities(),
  ])
  const group = groups.find((candidate) => candidate.id === groupId)
  if (!group) return null

  const memberOptions = buildMemberLabels(members, identities).sort(
    (first, second) => first.label.localeCompare(second.label) || first.member.id.localeCompare(second.member.id),
  )
  const memberOptionsById = new Map(memberOptions.map((option) => [option.member.id, option]))
  const membershipViews = memberships.flatMap((membership) => {
    const option = memberOptionsById.get(membership.memberId)
    return option ? [{ ...membership, memberLabel: option.label, memberDetail: option.detail }] : []
  })

  return {
    ...group,
    parentName: group.parentGroupId
      ? (groups.find((candidate) => candidate.id === group.parentGroupId)?.name ?? null)
      : null,
    groups,
    members: memberOptions,
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

export const groupManagementQuery = { listCollection, getDetail }

function compareMemberships(
  first: { id: string; memberLabel: string; startsAt: Date },
  second: { id: string; memberLabel: string; startsAt: Date },
) {
  return (
    first.memberLabel.localeCompare(second.memberLabel) ||
    first.startsAt.getTime() - second.startsAt.getTime() ||
    first.id.localeCompare(second.id)
  )
}

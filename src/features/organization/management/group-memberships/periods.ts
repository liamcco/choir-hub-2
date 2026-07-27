/** Pure read-model transformations for dated Group Membership relationships. */
import type { Group } from '@/core/topology'
import type { GroupMembership, User } from '@/drizzle/schema'
import { buildUserLabelMap, formatGroupPath } from '@/features/organization/core/labels'

export type GroupMembershipPeriod = GroupMembership & {
  group: Group
  user: User
  userLabel: string
  userDetail: string
}

/** Resolves persisted IDs into domain objects and preserves invalid-reference rows as errors. */
export function resolveGroupMembershipDetails(
  memberships: readonly GroupMembership[],
  groups: readonly Group[],
  users: readonly User[],
): GroupMembershipPeriod[] {
  const groupsById = new Map<string, Group>(groups.map((group) => [group.id, group]))
  const usersById = new Map(users.map((user) => [user.id, user]))
  const userOptionsById = buildUserLabelMap(users)
  return memberships
    .map((membership) => {
      const group = groupsById.get(membership.groupId)
      const user = usersById.get(membership.userId)
      const userOption = userOptionsById.get(membership.userId)
      if (!group || !user || !userOption) {
        throw new Error(
          `Invalid Group Membership ${membership.id}: ${!group ? `unknown Group ${membership.groupId}` : `unknown User ${membership.userId}`}.`,
        )
      }
      return { ...membership, group, user, userLabel: userOption.label, userDetail: userOption.detail }
    })
    .sort(
      (first, second) =>
        first.userLabel.localeCompare(second.userLabel) ||
        formatGroupPath(groups, first.group).localeCompare(formatGroupPath(groups, second.group)) ||
        first.startsAt.getTime() - second.startsAt.getTime() ||
        first.id.localeCompare(second.id),
    )
}

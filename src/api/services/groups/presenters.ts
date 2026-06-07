import { z } from 'zod'

import { groupSchema } from '@/api/models/group'

type Group = z.infer<typeof groupSchema>

type GroupWithKind = Omit<Group, 'directMemberCount' | 'effectiveMemberCount' | 'kindName'> & {
  kind: {
    name: string
  }
}

type MemberCountMap = ReadonlyMap<string, number>

export function toGroupWithMemberCounts(
  group: GroupWithKind,
  directMemberCounts: MemberCountMap,
  effectiveMemberCounts: MemberCountMap,
) {
  return groupSchema.parse({
    ...group,
    kindName: group.kind.name,
    directMemberCount: directMemberCounts.get(group.id) ?? 0,
    effectiveMemberCount: effectiveMemberCounts.get(group.id) ?? 0,
  })
}

import type { OrganizationRecord } from '@/organization/types'

export type AuthUserIdentity = {
  id: string
  name: string
  email: string
}

export type MemberLabel = {
  member: OrganizationRecord<'member'>
  label: string
  detail: string
}

export function buildMemberLabels(
  members: OrganizationRecord<'member'>[],
  users: Pick<AuthUserIdentity, 'id' | 'name' | 'email'>[],
): MemberLabel[] {
  const usersById = new Map(users.map((user) => [user.id, user]))
  return members.map((member) => {
    const user = usersById.get(member.userId)
    return {
      member,
      label: user?.name || formatMemberFallbackLabel(member),
      detail: user?.email ?? member.id,
    }
  })
}

export function formatMemberFallbackLabel(member: OrganizationRecord<'member'>) {
  return `Member ${member.id}`
}

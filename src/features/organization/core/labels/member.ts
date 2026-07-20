import type { Member } from '@/prisma/generated/client'

export type AuthUserIdentity = {
  id: string
  name: string
  email: string
}

export type MemberLabel = {
  member: Member
  label: string
  detail: string
}

export function buildMemberLabels(
  members: Member[],
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

export function formatMemberFallbackLabel(member: Member) {
  return `Member ${member.id}`
}

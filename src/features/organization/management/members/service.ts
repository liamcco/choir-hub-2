import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { organizationService } from '@/features/organization'
import type { Member, MemberStatus } from '@/prisma/generated/client'

export type AuthUserAccount = {
  id: string
  name: string
  email: string
  banned?: boolean | null
  createdAt: Date
}

export type ManagedMemberAccount =
  | { user: AuthUserAccount; member: Member; linkState: 'linked'; accessState: 'enabled' | 'disabled' }
  | { user: AuthUserAccount; member: null; linkState: 'unlinked'; accessState: 'enabled' | 'disabled' }

export async function listManagedMembers() {
  const requestHeaders = await headers()
  const [result, members] = await Promise.all([
    auth.api.listUsers({
      headers: requestHeaders,
      query: { limit: 1000, sortBy: 'name', sortDirection: 'asc' },
    }),
    organizationService.members.list(),
  ])
  const membersByUserId = new Map(members.map((member) => [member.userId, member]))
  return result.users.map((user): ManagedMemberAccount => {
    const member = membersByUserId.get(user.id) ?? null
    const account = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        banned: user.banned,
        createdAt: new Date(user.createdAt),
      },
      accessState: user.banned ? ('disabled' as const) : ('enabled' as const),
    }
    return member ? { ...account, member, linkState: 'linked' } : { ...account, member: null, linkState: 'unlinked' }
  })
}

export async function createMemberAccount(input: {
  name: string
  email: string
  password: string
  status: MemberStatus
}) {
  const requestHeaders = await headers()
  const result = await auth.api.createUser({
    headers: requestHeaders,
    body: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: 'user',
      data: { emailVerified: true },
    },
  })

  try {
    return await organizationService.members.create({ userId: result.user.id, status: input.status })
  } catch (error) {
    await auth.api.removeUser({ headers: requestHeaders, body: { userId: result.user.id } })
    throw error
  }
}

export function createLinkedMember(userId: string, status: MemberStatus) {
  return organizationService.members.create({ userId, status })
}

export function updateMemberStatus(memberId: string, status: MemberStatus) {
  return organizationService.members.updateStatus(memberId, status)
}

export async function updateAccountAccess(userId: string, accessState: 'enabled' | 'disabled') {
  const requestHeaders = await headers()
  if (accessState === 'disabled') {
    return auth.api.banUser({
      headers: requestHeaders,
      body: { userId, banReason: 'Access disabled by an admin.' },
    })
  }
  return auth.api.unbanUser({ headers: requestHeaders, body: { userId } })
}

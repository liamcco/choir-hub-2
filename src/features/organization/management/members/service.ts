import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { organizationService } from '@/features/organization'
import type { Member, MemberStatus } from '@/prisma/generated/client'

export type AccountAccessState = 'enabled' | 'disabled'

// TODO: Add pagination ( or remove limits? ) and extra fields
export type AuthUserAccount = {
  id: string
  name: string
  // image?: string | null

  email: string
  // emailVerified: boolean

  banned?: boolean | null
  // banReason?: string | null
  // banExpires?: Date | null

  createdAt: Date
  // updatedAt: Date

  // role?: string | null
}

export type ManagedMemberAccount = {
  user: AuthUserAccount
  accessState: 'enabled' | 'disabled'
} & (
  | {
      member: Member
      linkState: 'linked'
    }
  | {
      member: null
      linkState: 'unlinked'
    }
)
// TODO: getMember()
async function list(): Promise<ManagedMemberAccount[]> {
  const requestHeaders = await headers()
  const [result, members] = await Promise.all([
    auth.api.listUsers({
      headers: requestHeaders,
      query: { limit: 1000, sortBy: 'name', sortDirection: 'asc' },
    }),
    organizationService.members.list(),
  ])
  const membersById = new Map(members.map((member) => [member.id, member]))
  return result.users.map((user): ManagedMemberAccount => {
    const member = membersById.get(user.id) ?? null
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

async function createLinkedAccount(input: { name: string; email: string; password: string; status: MemberStatus }) {
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

async function linkExistingUser(userId: string, status: MemberStatus) {
  return organizationService.members.create({ userId, status })
}

async function updateMemberStatus(memberId: string, status: MemberStatus) {
  return organizationService.members.updateStatus(memberId, status)
}

async function updateAccountAccess(userId: string, accessState: AccountAccessState) {
  const requestHeaders = await headers()
  if (accessState === 'disabled') {
    return auth.api.banUser({
      headers: requestHeaders,
      body: { userId, banReason: 'Access disabled by an admin.' },
    })
  }
  return auth.api.unbanUser({ headers: requestHeaders, body: { userId } })
}

export const memberAccountService = {
  list,
  createLinkedAccount,
  linkExistingUser,
  updateMemberStatus,
  updateAccountAccess,
}

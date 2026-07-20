import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { organizationService } from '@/features/organization'
import type { Member, MemberStatus } from '@/prisma/generated/client'

type AccessState = 'enabled' | 'disabled'

export type AuthUserAccount = {
  id: string
  name: string
  email: string
  banned?: boolean | null
  createdAt: Date
}

export type ManagedMemberAccount =
  | { user: AuthUserAccount; member: Member; linkState: 'linked'; accessState: AccessState }
  | { user: AuthUserAccount; member: null; linkState: 'unlinked'; accessState: AccessState }

type MemberAccountLifecycleDependencies = {
  getRequestHeaders(): Promise<Headers>
  listAuthUsers(input: { headers: Headers }): Promise<{
    users: {
      id: string
      name: string
      email: string
      banned?: boolean | null
      createdAt: string | Date
    }[]
  }>
  createAuthUser(input: {
    headers: Headers
    body: { name: string; email: string; password: string; role: string; data: { emailVerified: boolean } }
  }): Promise<{ user: { id: string } }>
  removeAuthUser(input: { headers: Headers; body: { userId: string } }): Promise<unknown>
  banAuthUser(input: { headers: Headers; body: { userId: string; banReason: string } }): Promise<unknown>
  unbanAuthUser(input: { headers: Headers; body: { userId: string } }): Promise<unknown>
  listMembers(): Promise<Member[]>
  createMember(input: { userId: string; status: MemberStatus }): Promise<Member>
  updateMemberStatus(memberId: string, status: MemberStatus): Promise<Member>
}

export function createMemberAccountLifecycle(dependencies: MemberAccountLifecycleDependencies) {
  return {
    async listManagedMembers() {
      const requestHeaders = await dependencies.getRequestHeaders()
      const [result, members] = await Promise.all([
        dependencies.listAuthUsers({ headers: requestHeaders }),
        dependencies.listMembers(),
      ])
      return buildManagedMemberAccounts(result.users, members)
    },

    async createMemberAccount(input: {
      name: string
      email: string
      password: string
      status: MemberStatus
    }) {
      const requestHeaders = await dependencies.getRequestHeaders()
      const result = await dependencies.createAuthUser({
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
        return await dependencies.createMember({ userId: result.user.id, status: input.status })
      } catch (error) {
        await dependencies.removeAuthUser({ headers: requestHeaders, body: { userId: result.user.id } })
        throw error
      }
    },

    createLinkedMember(userId: string, status: MemberStatus) {
      return dependencies.createMember({ userId, status })
    },

    updateMemberStatus(memberId: string, status: MemberStatus) {
      return dependencies.updateMemberStatus(memberId, status)
    },

    async updateAccountAccess(userId: string, accessState: AccessState) {
      const requestHeaders = await dependencies.getRequestHeaders()
      if (accessState === 'disabled') {
        return dependencies.banAuthUser({
          headers: requestHeaders,
          body: { userId, banReason: 'Access disabled by an admin.' },
        })
      }
      return dependencies.unbanAuthUser({ headers: requestHeaders, body: { userId } })
    },
  }
}

export const memberAccountLifecycle = createMemberAccountLifecycle({
  getRequestHeaders: () => headers(),
  listAuthUsers: ({ headers: requestHeaders }) =>
    auth.api.listUsers({
      headers: requestHeaders,
      query: { limit: 1000, sortBy: 'name', sortDirection: 'asc' },
    }),
  createAuthUser: (input) => auth.api.createUser(input),
  removeAuthUser: (input) => auth.api.removeUser(input),
  banAuthUser: (input) => auth.api.banUser(input),
  unbanAuthUser: (input) => auth.api.unbanUser(input),
  listMembers: () => organizationService.members.list(),
  createMember: (input) => organizationService.members.create(input),
  updateMemberStatus: (memberId, status) => organizationService.members.updateStatus(memberId, status),
})

function buildManagedMemberAccounts(
  users: {
    id: string
    name: string
    email: string
    banned?: boolean | null
    createdAt: string | Date
  }[],
  members: Member[],
): ManagedMemberAccount[] {
  const membersByUserId = new Map(members.map((member) => [member.userId, member]))
  return users.map((user): ManagedMemberAccount => {
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

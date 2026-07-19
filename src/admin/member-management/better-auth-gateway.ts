import type { AccountAccessState, AuthAdminGateway, AuthUserAccount } from '@/admin/member-management/account-lifecycle'
import { auth } from '@/lib/auth'

export function createBetterAuthAdminGateway(requestHeaders: Headers): AuthAdminGateway {
  return {
    async listUsers() {
      const result = await auth.api.listUsers({
        headers: requestHeaders,
        query: {
          limit: 1000,
          sortBy: 'name',
          sortDirection: 'asc',
        },
      })

      return result.users.map(toAuthUserAccount)
    },
    async createUser(input) {
      const result = await auth.api.createUser({
        headers: requestHeaders,
        body: input,
      })

      return toAuthUserAccount(result.user)
    },
    async deleteUser(userId: string) {
      await auth.api.removeUser({
        headers: requestHeaders,
        body: { userId },
      })
    },
    async setAccessState(userId: string, state: AccountAccessState) {
      const result =
        state === 'disabled'
          ? await auth.api.banUser({
              headers: requestHeaders,
              body: {
                userId,
                banReason: 'Access disabled by an admin.',
              },
            })
          : await auth.api.unbanUser({
              headers: requestHeaders,
              body: { userId },
            })

      return toAuthUserAccount(result.user)
    },
  }
}

export type BetterAuthAdminUser = {
  id: string
  name: string
  email: string
  role?: string | string[] | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | string | null
  createdAt: Date | string
}

export function toAuthUserAccount(user: BetterAuthAdminUser): AuthUserAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeAuthUserRole(user.role),
    banned: user.banned,
    banReason: user.banReason,
    banExpires: user.banExpires ? new Date(user.banExpires) : null,
    createdAt: new Date(user.createdAt),
  }
}

function normalizeAuthUserRole(role?: string | string[] | null) {
  return Array.isArray(role) ? role.join(',') : role
}

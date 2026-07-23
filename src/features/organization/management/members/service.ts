import 'server-only'
import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { prisma } from '@/core/db'
import type { MemberStatus } from '@/prisma/generated/client'
export type AccountAccessState = 'enabled' | 'disabled'
async function createUser(input: { name: string; email: string; password: string; status: MemberStatus }) {
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
  return prisma.user.update({ where: { id: result.user.id }, data: { status: input.status } })
}
async function updateMemberStatus(userId: string, status: MemberStatus) {
  return prisma.user.update({ where: { id: userId }, data: { status } })
}
async function updateAccountAccess(userId: string, accessState: AccountAccessState) {
  const requestHeaders = await headers()
  return accessState === 'disabled'
    ? auth.api.banUser({ headers: requestHeaders, body: { userId, banReason: 'Access disabled by an admin.' } })
    : auth.api.unbanUser({ headers: requestHeaders, body: { userId } })
}
export const userService = { createUser, updateMemberStatus, updateAccountAccess }

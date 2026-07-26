import 'server-only'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { db } from '@/core/db'
import { type MemberStatus, user } from '@/drizzle/schema'

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
  return db
    .update(user)
    .set({ status: input.status.toLowerCase() as never, updatedAt: new Date() })
    .where(eq(user.id, result.user.id))
    .returning()
    .then((rows) => rows[0])
}
async function updateMemberStatus(userId: string, status: MemberStatus) {
  return db
    .update(user)
    .set({ status: status.toLowerCase() as never, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning()
    .then((rows) => rows[0])
}
export const userService = { createUser, updateMemberStatus }

import { eq } from 'drizzle-orm'
import { auth } from '@/core/auth/auth'
import type { db } from '@/core/db'
import { user } from '@/drizzle/schema'
import { seedDemo } from './demo'

export const e2eUsers = {
  member: { email: 'demo-conductor-mk@example.com', password: 'password' },
  admin: { email: 'e2e-admin@example.com', password: 'e2e-password' },
} as const

/** Build the deterministic database used by the production smoke suite. */
export async function seedE2E(database: typeof db): Promise<void> {
  await seedDemo(database)
  const { user: adminUser } = await auth.api.createUser({
    body: {
      email: e2eUsers.admin.email,
      password: e2eUsers.admin.password,
      name: 'E2E Admin',
      role: 'admin',
    },
  })
  await database.update(user).set({ emailVerified: true }).where(eq(user.id, adminUser.id))
}

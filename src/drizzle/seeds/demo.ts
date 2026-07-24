import { eq } from 'drizzle-orm'
import { auth } from '@/core/auth/auth'
import type { db } from '@/core/db'
import type { MemberStatus } from '@/drizzle/schema'
import { groupMembership, positionAssignment, user as userTable } from '@/drizzle/schema'
import { seedFoundation } from './foundation'

/**
 * Demo/development/e2e seed data.
 *
 * Add realistic Users, Groups, Positions, Group Memberships, and Position
 * Assignments here. Prefer stable IDs so e2e fixtures can refer to records.
 */
export async function seedDemo(database: typeof db): Promise<void> {
  await seedFoundation(database)

  const voices = ['a1', 'a2', 'b1', 'b2', 's1', 's2', 't1', 't2'] as const
  const statuses: MemberStatus[] = [
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'PASSIVE',
    'ACTIVE',
    'FORMER',
    'ACTIVE',
    'ACTIVE',
  ]
  const users = voices.flatMap((voice) =>
    Array.from({ length: 10 }, (_, index) => {
      const number = index + 1
      return {
        id: `demo-user-${voice}-${number}`,
        name: `${voice.toUpperCase()} Demo ${number}`,
        email: `demo-${voice}-${number}@example.com`,
        status: statuses[index],
        voice,
      }
    }),
  )

  const userIds = new Map<string, string>()
  const userIdFor = (email: string) => {
    const id = userIds.get(email)
    if (!id) throw new Error(`Demo seed could not resolve User ${email}.`)
    return id
  }

  for (const user of users) {
    const [existing] = await database.select().from(userTable).where(eq(userTable.email, user.email)).limit(1)
    if (!existing) {
      const result = await auth.api.createUser({
        body: {
          email: user.email,
          password: 'password',
          name: user.name,
          data: { status: user.status.toLowerCase() },
        },
      })
      userIds.set(user.email, result.user.id)
      await database
        .update(userTable)
        .set({ status: user.status.toLowerCase() as typeof userTable.$inferInsert.status })
        .where(eq(userTable.id, result.user.id))
    } else {
      userIds.set(user.email, existing.id)
      await database
        .update(userTable)
        .set({ name: user.name, status: user.status.toLowerCase() as typeof userTable.$inferInsert.status })
        .where(eq(userTable.id, existing.id))
    }
  }

  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const choirIds = ['mk', 'dk', 'kk'] as const
  const memberships = users.flatMap((user, index) => [
    { userId: userIdFor(user.email), groupId: user.voice },
    { userId: userIdFor(user.email), groupId: choirIds[index % choirIds.length] },
  ])

  for (const membership of memberships) {
    await database
      .insert(groupMembership)
      .values({ id: `demo-membership-${membership.userId}-${membership.groupId}`, ...membership, startsAt })
      .onConflictDoUpdate({ target: groupMembership.id, set: { endsAt: null, startsAt } })
  }

  const boardUsers = users.slice(0, 8)
  for (const [index, user] of boardUsers.entries()) {
    const userId = userIdFor(user.email)
    const membershipId = `demo-membership-${userId}-board`
    await database
      .insert(groupMembership)
      .values({ id: membershipId, userId, groupId: 'board', startsAt })
      .onConflictDoUpdate({ target: groupMembership.id, set: { endsAt: null, startsAt } })

    const positionId = [
      'president',
      'vice-president',
      'treasurer',
      'secretary',
      'master-of-parties',
      'master-of-gigs',
      'master-of-concerts',
      'master-of-pr',
    ][index]
    await database
      .insert(positionAssignment)
      .values({ id: `demo-assignment-${positionId}`, positionId, userId, startsAt })
      .onConflictDoUpdate({ target: positionAssignment.id, set: { endsAt: null, startsAt, userId } })
  }

  const committeeIds = ['concertmastery', 'gigmastery', 'partymastery', 'webmastery', 'tourcommittee', 'reccommittee']
  for (const [index, committeeId] of committeeIds.entries()) {
    const user = users[20 + index]
    const userId = userIdFor(user.email)
    const id = `demo-membership-${userId}-${committeeId}`
    await database
      .insert(groupMembership)
      .values({ id, userId, groupId: committeeId, startsAt })
      .onConflictDoUpdate({ target: groupMembership.id, set: { endsAt: null, startsAt } })
  }
}

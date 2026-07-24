import { auth } from '@/core/auth/auth'
import type { Database } from '@/core/db/database'
import type { MemberStatus } from '@/drizzle/schema'
import { seedFoundation } from './foundation'

/**
 * Demo/development/e2e seed data.
 *
 * Add realistic Users, Groups, Positions, Group Memberships, and Position
 * Assignments here. Prefer stable IDs so e2e fixtures can refer to records.
 */
export async function seedDemo(database: Database): Promise<void> {
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
    const existing = await database.user.findUnique({ where: { email: user.email } })
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
      await database.user.update({ where: { id: result.user.id }, data: { status: user.status } })
    } else {
      userIds.set(user.email, existing.id)
      await database.user.update({ where: { id: existing.id }, data: { name: user.name, status: user.status } })
    }
  }

  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const choirIds = ['mk', 'dk', 'kk'] as const
  const memberships = users.flatMap((user, index) => [
    { userId: userIdFor(user.email), groupId: user.voice },
    { userId: userIdFor(user.email), groupId: choirIds[index % choirIds.length] },
  ])

  for (const membership of memberships) {
    await database.groupMembership.upsert({
      where: { id: `demo-membership-${membership.userId}-${membership.groupId}` },
      create: { id: `demo-membership-${membership.userId}-${membership.groupId}`, ...membership, startsAt },
      update: { endsAt: null, startsAt },
    })
  }

  const boardUsers = users.slice(0, 8)
  for (const [index, user] of boardUsers.entries()) {
    const userId = userIdFor(user.email)
    const membershipId = `demo-membership-${userId}-board`
    await database.groupMembership.upsert({
      where: { id: membershipId },
      create: { id: membershipId, userId, groupId: 'board', startsAt },
      update: { endsAt: null, startsAt },
    })

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
    await database.positionAssignment.upsert({
      where: { id: `demo-assignment-${positionId}` },
      create: { id: `demo-assignment-${positionId}`, positionId, userId, startsAt },
      update: { endsAt: null, startsAt, userId },
    })
  }

  const committeeIds = ['concertmastery', 'gigmastery', 'partymastery', 'webmastery', 'tourcommittee', 'reccommittee']
  for (const [index, committeeId] of committeeIds.entries()) {
    const user = users[20 + index]
    const userId = userIdFor(user.email)
    const id = `demo-membership-${userId}-${committeeId}`
    await database.groupMembership.upsert({
      where: { id },
      create: { id, userId, groupId: committeeId, startsAt },
      update: { endsAt: null, startsAt },
    })
  }
}

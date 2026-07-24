import { auth } from '@/core/auth/auth'
import type { MemberStatus, PrismaClient } from '@/prisma/generated/client'
import { seedFoundation } from './foundation'

/**
 * Demo/development/e2e seed data.
 *
 * Add realistic Users, Groups, Positions, Group Memberships, and Position
 * Assignments here. Prefer stable IDs so e2e fixtures can refer to records.
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedFoundation(prisma)

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

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } })
    if (!existing) {
      const result = await auth.api.createUser({
        body: {
          email: user.email,
          password: 'password',
          name: user.name,
          data: { status: user.status },
        },
      })
      await prisma.user.update({ where: { id: result.user.id }, data: { id: user.id, status: user.status } })
    } else {
      await prisma.user.update({ where: { id: existing.id }, data: { name: user.name, status: user.status } })
    }
  }

  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const choirIds = ['mk', 'dk', 'kk'] as const
  const memberships = users.flatMap((user, index) => [
    { userId: user.id, groupId: user.voice },
    { userId: user.id, groupId: choirIds[index % choirIds.length] },
  ])

  for (const membership of memberships) {
    await prisma.groupMembership.upsert({
      where: { id: `demo-membership-${membership.userId}-${membership.groupId}` },
      create: { id: `demo-membership-${membership.userId}-${membership.groupId}`, ...membership, startsAt },
      update: { endsAt: null, startsAt },
    })
  }

  const boardUsers = users.slice(0, 8)
  for (const [index, user] of boardUsers.entries()) {
    const membershipId = `demo-membership-${user.id}-board`
    await prisma.groupMembership.upsert({
      where: { id: membershipId },
      create: { id: membershipId, userId: user.id, groupId: 'board', startsAt },
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
    await prisma.positionAssignment.upsert({
      where: { id: `demo-assignment-${positionId}` },
      create: { id: `demo-assignment-${positionId}`, positionId, userId: user.id, startsAt },
      update: { endsAt: null, startsAt, userId: user.id },
    })
  }

  const committeeIds = ['concertmastery', 'gigmastery', 'partymastery', 'webmastery', 'tourcommittee', 'reccommittee']
  for (const [index, committeeId] of committeeIds.entries()) {
    const user = users[20 + index]
    const id = `demo-membership-${user.id}-${committeeId}`
    await prisma.groupMembership.upsert({
      where: { id },
      create: { id, userId: user.id, groupId: committeeId, startsAt },
      update: { endsAt: null, startsAt },
    })
  }
}

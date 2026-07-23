import type { PrismaClient } from '@/prisma/generated/client'

import { seedFoundation } from './foundation'

/**
 * Demo/development/e2e seed data.
 *
 * Add realistic Users, Groups, Positions, Group Memberships, and Position
 * Assignments here. Prefer stable IDs so e2e fixtures can refer to records.
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedFoundation(prisma)

  const users = [
    { id: 'seed-member-anna', name: 'Anna', email: 'anna@example.invalid', status: 'ACTIVE' as const },
    { id: 'seed-member-ben', name: 'Ben', email: 'ben@example.invalid', status: 'ACTIVE' as const },
    { id: 'seed-member-clara', name: 'Clara', email: 'clara@example.invalid', status: 'PASSIVE' as const },
  ]

  for (const user of users) {
    await prisma.user.upsert({ where: { id: user.id }, create: user, update: user })
  }

  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const memberships = [
    { userId: 'seed-member-anna', groupId: 'seed-group-sopranos' },
    { userId: 'seed-member-ben', groupId: 'seed-group-altos' },
    { userId: 'seed-member-clara', groupId: 'seed-group-committee' },
  ]

  for (const membership of memberships) {
    await prisma.groupMembership.upsert({
      where: { id: `seed-membership-${membership.userId}-${membership.groupId}` },
      create: { id: `seed-membership-${membership.userId}-${membership.groupId}`, ...membership, startsAt },
      update: { endsAt: null, startsAt },
    })
  }

  const assignments = [
    { id: 'seed-assignment-conductor', positionId: 'seed-position-conductor', userId: 'seed-member-anna' },
    { id: 'seed-assignment-soprano-lead', positionId: 'seed-position-section-lead', userId: 'seed-member-anna' },
    { id: 'seed-assignment-board-chair', positionId: 'seed-position-board-chair', userId: 'seed-member-clara' },
  ]

  for (const assignment of assignments) {
    await prisma.positionAssignment.upsert({
      where: { id: assignment.id },
      create: { ...assignment, startsAt },
      update: { endsAt: null, startsAt, userId: assignment.userId, positionId: assignment.positionId },
    })
  }
}

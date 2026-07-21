import type { PrismaClient } from '@/prisma/generated/client'

import { seedFoundation } from './foundation'

/**
 * Demo/development/e2e seed data.
 *
 * Add realistic Members, Groups, Positions, Group Memberships, and Position
 * Assignments here. Prefer stable IDs so e2e fixtures can refer to records.
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedFoundation(prisma)

  const members = [
    { id: 'seed-member-anna', status: 'ACTIVE' as const },
    { id: 'seed-member-ben', status: 'ACTIVE' as const },
    { id: 'seed-member-clara', status: 'PASSIVE' as const },
  ]

  for (const member of members) {
    await prisma.member.upsert({ where: { id: member.id }, create: member, update: member })
  }

  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const memberships = [
    { memberId: 'seed-member-anna', groupId: 'seed-group-sopranos' },
    { memberId: 'seed-member-ben', groupId: 'seed-group-altos' },
    { memberId: 'seed-member-clara', groupId: 'seed-group-committee' },
  ]

  for (const membership of memberships) {
    await prisma.groupMembership.upsert({
      where: { id: `seed-membership-${membership.memberId}-${membership.groupId}` },
      create: { id: `seed-membership-${membership.memberId}-${membership.groupId}`, ...membership, startsAt },
      update: { endsAt: null, startsAt },
    })
  }

  const assignments = [
    { id: 'seed-assignment-conductor', positionId: 'seed-position-conductor', memberId: 'seed-member-anna' },
    { id: 'seed-assignment-soprano-lead', positionId: 'seed-position-section-lead', memberId: 'seed-member-anna' },
    { id: 'seed-assignment-board-chair', positionId: 'seed-position-board-chair', memberId: 'seed-member-clara' },
  ]

  for (const assignment of assignments) {
    await prisma.positionAssignment.upsert({
      where: { id: assignment.id },
      create: { ...assignment, startsAt },
      update: { endsAt: null, startsAt, memberId: assignment.memberId, positionId: assignment.positionId },
    })
  }
}

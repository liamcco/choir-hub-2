import type { PrismaClient } from '@/prisma/generated/client'

/**
 * Operational/domain seed data shared by environments.
 *
 * Add durable Groups, Positions, and Position Scopes here. Keep this seed free
 * of people, memberships, assignments, and authentication data.
 */
export async function seedFoundation(prisma: PrismaClient): Promise<void> {
  const groups = [
    { id: 'seed-group-choir', kind: 'CHOIR' as const, name: 'Sample Choir', parentGroupId: null },
    { id: 'seed-group-sopranos', kind: 'SECTION' as const, name: 'Sopranos', parentGroupId: 'seed-group-choir' },
    { id: 'seed-group-altos', kind: 'SECTION' as const, name: 'Altos', parentGroupId: 'seed-group-choir' },
    {
      id: 'seed-group-committee',
      kind: 'COMMITTEE' as const,
      name: 'Music Committee',
      parentGroupId: 'seed-group-choir',
    },
    { id: 'seed-group-board', kind: 'BOARD' as const, name: 'Choir Board', parentGroupId: 'seed-group-choir' },
    { id: 'seed-group-project', kind: 'PROJECT' as const, name: 'Spring Concert', parentGroupId: 'seed-group-choir' },
  ]

  for (const group of groups) {
    await prisma.group.upsert({ where: { id: group.id }, create: group, update: group })
  }

  const positions = [
    { id: 'seed-position-conductor', name: 'Conductor', description: 'Leads the choir.' },
    { id: 'seed-position-section-lead', name: 'Section Lead', description: 'Coordinates a voice section.' },
    { id: 'seed-position-board-chair', name: 'Chair', description: 'Chairs the choir board.' },
  ]

  for (const position of positions) {
    await prisma.position.upsert({ where: { id: position.id }, create: position, update: position })
  }

  const scopes = [
    ['seed-position-conductor', 'seed-group-choir'],
    ['seed-position-section-lead', 'seed-group-sopranos'],
    ['seed-position-section-lead', 'seed-group-altos'],
    ['seed-position-board-chair', 'seed-group-board'],
  ] as const

  for (const [positionId, groupId] of scopes) {
    await prisma.positionScope.upsert({
      where: { positionId_groupId: { positionId, groupId } },
      create: { positionId, groupId },
      update: {},
    })
  }
}

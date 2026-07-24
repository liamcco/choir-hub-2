import type { Database } from '@/core/db/database'

/**
 * Operational/domain seed data shared by environments.
 *
 * Add durable Groups, Positions, and Position Scopes here. Keep this seed free
 * of people, memberships, assignments, and authentication data.
 */
export async function seedFoundation(database: Database): Promise<void> {
  const groups = [
    { id: 'kk', kind: 'CHOIR' as const, name: 'KK', parentGroupId: null },
    { id: 'dk', kind: 'CHOIR' as const, name: 'DK', parentGroupId: null },
    { id: 'mk', kind: 'CHOIR' as const, name: 'MK', parentGroupId: null },
    { id: 'csk', kind: 'CHOIR' as const, name: 'CSK', parentGroupId: null },

    { id: 'satb', kind: 'SECTION' as const, name: 'SATB', parentGroupId: 'csk' },
    { id: 'sa', kind: 'SECTION' as const, name: 'SA', parentGroupId: 'satb' },
    { id: 'tb', kind: 'SECTION' as const, name: 'TB', parentGroupId: 'satb' },
    { id: 's', kind: 'SECTION' as const, name: 'S', parentGroupId: 'sa' },
    { id: 'a', kind: 'SECTION' as const, name: 'A', parentGroupId: 'sa' },
    { id: 't', kind: 'SECTION' as const, name: 'T', parentGroupId: 'tb' },
    { id: 'b', kind: 'SECTION' as const, name: 'B', parentGroupId: 'tb' },
    { id: 's1', kind: 'SECTION' as const, name: 'S1', parentGroupId: 's' },
    { id: 's2', kind: 'SECTION' as const, name: 'S2', parentGroupId: 's' },
    { id: 'a1', kind: 'SECTION' as const, name: 'A1', parentGroupId: 'a' },
    { id: 'a2', kind: 'SECTION' as const, name: 'A2', parentGroupId: 'a' },
    { id: 't1', kind: 'SECTION' as const, name: 'T1', parentGroupId: 't' },
    { id: 't2', kind: 'SECTION' as const, name: 'T2', parentGroupId: 't' },
    { id: 'b1', kind: 'SECTION' as const, name: 'B1', parentGroupId: 'b' },
    { id: 'b2', kind: 'SECTION' as const, name: 'B2', parentGroupId: 'b' },

    { id: 'board', kind: 'BOARD' as const, name: 'Board', parentGroupId: 'csk' },

    { id: 'concertmastery', kind: 'COMMITTEE' as const, name: 'Concert Mastery', parentGroupId: 'csk' },
    { id: 'gigmastery', kind: 'COMMITTEE' as const, name: 'Gig Mastery', parentGroupId: 'csk' },
    { id: 'partymastery', kind: 'COMMITTEE' as const, name: 'Party Mastery', parentGroupId: 'csk' },
    { id: 'webmastery', kind: 'COMMITTEE' as const, name: 'Web Mastery', parentGroupId: 'csk' },

    { id: 'tourcommittee', kind: 'COMMITTEE' as const, name: 'Tour Committee', parentGroupId: 'csk' },
    { id: 'reccommittee', kind: 'COMMITTEE' as const, name: 'Recruitment Committee', parentGroupId: 'csk' },
  ]

  for (const group of groups) {
    await database.group.upsert({ where: { id: group.id }, create: group, update: group })
  }

  const positions = [
    { id: 'president', name: 'President' },
    { id: 'vice-president', name: 'Vice President' },
    { id: 'treasurer', name: 'Treasurer' },
    { id: 'secretary', name: 'Secretary' },
    { id: 'master-of-parties', name: 'Master of Parties' },
    { id: 'master-of-gigs', name: 'Master of Gigs' },
    { id: 'master-of-concerts', name: '1st Master of Concerts' },
    { id: 'master-of-pr', name: 'Master of PR' },
  ]

  for (const position of positions) {
    await database.position.upsert({ where: { id: position.id }, create: position, update: position })
  }

  const scopes = [
    ['president', 'board'],
    ['vice-president', 'board'],
    ['treasurer', 'board'],
    ['secretary', 'board'],
    ['master-of-parties', 'board'],
    ['master-of-gigs', 'board'],
    ['master-of-concerts', 'board'],
    ['master-of-pr', 'board'],
  ] as const

  for (const [positionId, groupId] of scopes) {
    await database.positionScope.upsert({
      where: { positionId_groupId: { positionId, groupId } },
      create: { positionId, groupId },
      update: {},
    })
  }
}

import { auth } from '@/core/auth/auth'
import type { Database } from '@/core/db/database'
import { seedFoundation } from './foundation'

/** Demo/development/e2e people and dated relationships for the fixed catalog. */
export async function seedDemo(database: Database): Promise<void> {
  await seedFoundation(database)

  const fixtures = [
    ['mk', 't1'],
    ['mk', 't2'],
    ['mk', 'b1'],
    ['mk', 'b2'],
    ['kk', 's1'],
    ['kk', 's2'],
    ['kk', 'a1'],
    ['kk', 'a2'],
    ['kk', 't1'],
    ['kk', 't2'],
    ['kk', 'b1'],
    ['kk', 'b2'],
    ['dk', 's1'],
    ['dk', 's2'],
    ['dk', 'a1'],
    ['dk', 'a2'],
  ] as const
  const startsAt = new Date('2026-01-01T00:00:00.000Z')
  const userIds: string[] = []

  for (const [index, [choirId, voiceType]] of fixtures.entries()) {
    const email = `demo-${choirId}-${voiceType}-${index + 1}@example.com`
    const name = `${choirId.toUpperCase()} ${voiceType} Demo ${index + 1}`
    const existing = await database.user.findUnique({ where: { email } })
    const userId = existing?.id ?? (await auth.api.createUser({ body: { email, password: 'password', name } })).user.id
    userIds.push(userId)
    await database.user.update({
      where: { id: userId },
      data: { name, status: index === fixtures.length - 1 ? 'FORMER' : 'ACTIVE' },
    })

    if (index < fixtures.length - 1) {
      await database.choirMembership.upsert({
        where: { id: `demo-choir-membership-${index}` },
        create: { id: `demo-choir-membership-${index}`, userId, choirId, startsAt },
        update: { userId, choirId, startsAt, endsAt: null },
      })
      await database.sectionPlacement.upsert({
        where: { id: `demo-section-placement-${index}` },
        create: { id: `demo-section-placement-${index}`, userId, sectionId: `${choirId}-${voiceType}`, startsAt },
        update: { userId, sectionId: `${choirId}-${voiceType}`, startsAt, endsAt: null },
      })
    }
  }

  const assignmentExamples = [
    ['president', userIds[0]],
    ['master-of-parties', userIds[1]],
    ['mk-conductor', userIds[2]],
    ['kk-s-voice-parent', userIds[4]],
    ['tour-treasurer', userIds[5]],
  ] as const
  for (const [positionId, userId] of assignmentExamples) {
    await database.positionAssignment.upsert({
      where: { id: `demo-assignment-${positionId}` },
      create: { id: `demo-assignment-${positionId}`, positionId, userId, startsAt },
      update: { userId, startsAt, endsAt: null },
    })
  }

  await database.groupMembership.upsert({
    where: { id: 'demo-committee-membership' },
    create: { id: 'demo-committee-membership', userId: userIds[6], groupId: 'recruitment-committee', startsAt },
    update: { userId: userIds[6], startsAt, endsAt: null },
  })
}

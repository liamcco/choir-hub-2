import { eq } from 'drizzle-orm'
import { auth } from '@/core/auth/auth'
import type { db } from '@/core/db'
import { choirMembership, groupMembership, positionAssignment, sectionPlacement, user } from '@/drizzle/schema'
import { demoSeedData } from './demo-data'

/** Seed the demo data defined in demo-data.ts. */
export async function seedDemo(database: typeof db): Promise<void> {
  const startsAt = new Date(demoSeedData.startsAt)
  const userIds = new Map<string, string>()

  for (const [index, person] of demoSeedData.people.entries()) {
    const [existing] = await database.select().from(user).where(eq(user.email, person.email)).limit(1)
    const userId =
      existing?.id ??
      (
        await auth.api.createUser({
          body: { email: person.email, password: demoSeedData.userPassword, name: person.name },
        })
      ).user.id

    userIds.set(person.key, userId)
    await database
      .update(user)
      .set({ name: person.name, status: person.status, emailVerified: true })
      .where(eq(user.id, userId))

    if ('choirId' in person) {
      await database
        .insert(choirMembership)
        .values({ id: `demo-choir-membership-${index}`, userId, choirId: person.choirId, startsAt })
        .onConflictDoUpdate({
          target: choirMembership.id,
          set: { userId, choirId: person.choirId, startsAt, endsAt: null },
        })
    }
    if ('sectionId' in person && 'voice' in person) {
      await database
        .insert(sectionPlacement)
        .values({
          id: `demo-section-placement-${index}`,
          userId,
          sectionId: person.sectionId,
          voice: person.voice,
          startsAt,
        })
        .onConflictDoUpdate({
          target: sectionPlacement.id,
          set: { userId, sectionId: person.sectionId, voice: person.voice, startsAt, endsAt: null },
        })
    }
  }

  for (const assignment of demoSeedData.positionAssignments) {
    const userId = userIds.get(assignment.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${assignment.personKey}.`)
    await database
      .insert(positionAssignment)
      .values({ id: `demo-assignment-${assignment.positionId}`, positionId: assignment.positionId, userId, startsAt })
      .onConflictDoUpdate({ target: positionAssignment.id, set: { userId, startsAt, endsAt: null } })
  }

  for (const membership of demoSeedData.groupMemberships) {
    const userId = userIds.get(membership.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${membership.personKey}.`)
    await database
      .insert(groupMembership)
      .values({ id: membership.id, userId, groupId: membership.groupId, startsAt })
      .onConflictDoUpdate({ target: groupMembership.id, set: { userId, startsAt, endsAt: null } })
  }

  for (const membership of demoSeedData.historicalChoirMemberships) {
    const userId = userIds.get(membership.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${membership.personKey}.`)
    await database
      .insert(choirMembership)
      .values({
        id: membership.id,
        userId,
        choirId: membership.choirId,
        startsAt: new Date(membership.startsAt),
        endsAt: new Date(membership.endsAt),
      })
      .onConflictDoUpdate({
        target: choirMembership.id,
        set: {
          userId,
          choirId: membership.choirId,
          startsAt: new Date(membership.startsAt),
          endsAt: new Date(membership.endsAt),
        },
      })
  }

  for (const placement of demoSeedData.historicalSectionPlacements) {
    const userId = userIds.get(placement.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${placement.personKey}.`)
    await database
      .insert(sectionPlacement)
      .values({
        id: `demo-history-placement-${placement.personKey}`,
        userId,
        sectionId: placement.sectionId,
        voice: placement.voice,
        startsAt: new Date(placement.startsAt),
        endsAt: new Date(placement.endsAt),
      })
      .onConflictDoUpdate({
        target: sectionPlacement.id,
        set: {
          userId,
          sectionId: placement.sectionId,
          voice: placement.voice,
          startsAt: new Date(placement.startsAt),
          endsAt: new Date(placement.endsAt),
        },
      })
  }

  for (const membership of demoSeedData.historicalGroupMemberships) {
    const userId = userIds.get(membership.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${membership.personKey}.`)
    await database
      .insert(groupMembership)
      .values({
        id: membership.id,
        userId,
        groupId: membership.targetId,
        startsAt: new Date(membership.startsAt),
        endsAt: new Date(membership.endsAt),
      })
      .onConflictDoUpdate({
        target: groupMembership.id,
        set: {
          userId,
          groupId: membership.targetId,
          startsAt: new Date(membership.startsAt),
          endsAt: new Date(membership.endsAt),
        },
      })
  }

  for (const assignment of demoSeedData.historicalPositionAssignments) {
    const userId = userIds.get(assignment.personKey)
    if (!userId) throw new Error(`Demo seed references an unknown person: ${assignment.personKey}.`)
    await database
      .insert(positionAssignment)
      .values({
        id: assignment.id,
        positionId: assignment.targetId,
        userId,
        startsAt: new Date(assignment.startsAt),
        endsAt: new Date(assignment.endsAt),
      })
      .onConflictDoUpdate({
        target: positionAssignment.id,
        set: {
          userId,
          positionId: assignment.targetId,
          startsAt: new Date(assignment.startsAt),
          endsAt: new Date(assignment.endsAt),
        },
      })
  }
}

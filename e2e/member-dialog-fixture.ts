import 'dotenv/config'
import { eq, inArray } from 'drizzle-orm'
import { auth } from '@/core/auth/auth'
import { db, sql } from '@/core/db'
import { group, groupMembership, user } from '@/drizzle/schema'

const email = 'member-dialog-e2e@example.invalid'
const name = 'Member Dialog E2E'
const parentGroupFixture = { name: 'Group Dialog E2E', description: 'E2E parent with no direct Members' }
const childGroupFixture = { name: 'Group Child E2E', description: 'E2E child with one direct Member' }
const createdGroupFixture = { name: 'Created Group E2E', description: 'Created through the route-backed dialog' }
const groupFixtures = [parentGroupFixture, childGroupFixture, createdGroupFixture]

async function removeFixture() {
  const existingGroups = await db
    .select()
    .from(group)
    .where(
      inArray(
        group.name,
        groupFixtures.map((fixture) => fixture.name),
      ),
    )
  const unexpectedGroup = existingGroups.find(
    (group) => groupFixtures.find((fixture) => fixture.name === group.name)?.description !== group.description,
  )
  if (unexpectedGroup) throw new Error(`Refusing to replace non-test Group ${unexpectedGroup.name}.`)
  if (existingGroups.length)
    await db.delete(groupMembership).where(
      inArray(
        groupMembership.groupId,
        existingGroups.map((item) => item.id),
      ),
    )
  if (existingGroups.length)
    await db.delete(group).where(
      inArray(
        group.id,
        existingGroups.map((item) => item.id),
      ),
    )
  const [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1)
  if (!existing) return
  if (existing.name !== name) throw new Error(`Refusing to replace non-test account ${email}.`)
  await db.delete(user).where(eq(user.id, existing.id))
}

async function main() {
  if (process.env.DB_MODE !== 'local') throw new Error('E2E fixtures require DB_MODE=local.')
  const command = process.argv[2]
  await removeFixture()
  if (command === 'teardown') return
  if (command !== 'setup') throw new Error('Expected setup or teardown.')

  const result = await auth.api.createUser({
    body: { email, name, password: 'member-dialog-e2e-password', role: 'admin' },
  })
  const [parentGroup] = await db
    .insert(group)
    .values({ ...parentGroupFixture, kind: 'choir' })
    .returning()
  const [childGroup] = await db
    .insert(group)
    .values({
      ...childGroupFixture,
      kind: 'section',
      parentGroupId: parentGroup.id,
    })
    .returning()
  await db
    .insert(groupMembership)
    .values({ groupId: childGroup.id, userId: result.user.id, startsAt: new Date('2025-01-01T00:00:00Z') })
}

try {
  await main()
} finally {
  await sql.end()
}

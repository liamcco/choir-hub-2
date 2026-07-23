import 'dotenv/config'
import { auth } from '@/core/auth/auth'
import { prisma } from '@/core/db'

const email = 'member-dialog-e2e@example.invalid'
const name = 'Member Dialog E2E'
const parentGroupFixture = { name: 'Group Dialog E2E', description: 'E2E parent with no direct Members' }
const childGroupFixture = { name: 'Group Child E2E', description: 'E2E child with one direct Member' }
const createdGroupFixture = { name: 'Created Group E2E', description: 'Created through the route-backed dialog' }
const groupFixtures = [parentGroupFixture, childGroupFixture, createdGroupFixture]

async function removeFixture() {
  const existingGroups = await prisma.group.findMany({
    where: { name: { in: groupFixtures.map((fixture) => fixture.name) } },
  })
  const unexpectedGroup = existingGroups.find(
    (group) => groupFixtures.find((fixture) => fixture.name === group.name)?.description !== group.description,
  )
  if (unexpectedGroup) throw new Error(`Refusing to replace non-test Group ${unexpectedGroup.name}.`)
  await prisma.group.deleteMany({ where: { id: { in: existingGroups.map((group) => group.id) } } })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) return
  if (existing.name !== name) throw new Error(`Refusing to replace non-test account ${email}.`)
  await prisma.user.delete({ where: { id: existing.id } })
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
  const parentGroup = await prisma.group.create({
    data: { ...parentGroupFixture, kind: 'CHOIR' },
  })
  const childGroup = await prisma.group.create({
    data: {
      ...childGroupFixture,
      kind: 'SECTION',
      parentGroupId: parentGroup.id,
    },
  })
  await prisma.groupMembership.create({
    data: { groupId: childGroup.id, userId: result.user.id, startsAt: new Date('2025-01-01T00:00:00Z') },
  })
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}

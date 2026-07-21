import 'dotenv/config'
import { auth } from '@/core/auth/auth'
import { prisma } from '@/core/db'

const email = 'member-dialog-e2e@example.invalid'
const name = 'Member Dialog E2E'

async function removeFixture() {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) return
  if (existing.name !== name) throw new Error(`Refusing to replace non-test account ${email}.`)
  await prisma.member.deleteMany({ where: { id: existing.id } })
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
  await prisma.member.create({ data: { id: result.user.id, status: 'ACTIVE' } })
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}

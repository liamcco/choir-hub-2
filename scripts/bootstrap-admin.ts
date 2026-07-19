import 'dotenv/config'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Local Admin'

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required.')
  process.exit(1)
}

if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.')
  process.exit(1)
}

const [{ prisma }, { auth }] = await Promise.all([import('@/db'), import('@/lib/auth')])

const existingUser = await prisma.user.findUnique({
  where: { email },
})

if (existingUser) {
  const roleSet = new Set((existingUser.role ?? 'user').split(',').map((role) => role.trim()))
  roleSet.add('admin')

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      role: [...roleSet].filter(Boolean).join(','),
      name,
    },
  })

  console.log(`Promoted existing user to admin: ${user.email}`)
  console.log('Existing user password was not changed.')
} else {
  const result = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: 'admin',
    },
  })

  console.log(`Created admin user: ${result.user.email}`)
}

await prisma.$disconnect()

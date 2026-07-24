import 'dotenv/config'

export const DEFAULT_ADMIN_NAME = 'Local Admin'

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeRoles(role: string | null | undefined): string {
  const roles = (role ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!roles.includes('admin')) {
    roles.push('admin')
  }

  return [...new Set(roles)].join(',')
}

export function readAdminConfig(environment: { ADMIN_EMAIL?: string; ADMIN_PASSWORD?: string; ADMIN_NAME?: string }) {
  const email = environment.ADMIN_EMAIL ? normalizeAdminEmail(environment.ADMIN_EMAIL) : ''
  const password = environment.ADMIN_PASSWORD ?? ''
  const name = environment.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.')
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.')
  }

  return { email, password, name }
}

type BootstrapDependencies = {
  database: {
    user: {
      findUnique: (args: {
        where: { email: string }
      }) => Promise<{ id: string; email: string; role?: string | null } | null>
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<{ email: string }>
    }
    $disconnect: () => Promise<void>
  }
  auth: {
    api: {
      createUser: (args: {
        body: { email: string; password: string; name: string; role: 'admin' }
      }) => Promise<{ user: { email: string } }>
    }
  }
}

export async function bootstrapAdmin(
  dependencies: BootstrapDependencies,
  config: { email: string; password: string; name: string },
) {
  const existingUser = await dependencies.database.user.findUnique({ where: { email: config.email } })

  if (existingUser) {
    const user = await dependencies.database.user.update({
      where: { id: existingUser.id },
      data: {
        role: normalizeRoles(existingUser.role),
        emailVerified: true,
      },
    })

    return { action: 'promoted' as const, user }
  }

  const result = await dependencies.auth.api.createUser({
    body: { ...config, role: 'admin' },
  })

  return { action: 'created' as const, user: result.user }
}

if (import.meta.main) {
  try {
    const config = readAdminConfig({
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      ADMIN_NAME: process.env.ADMIN_NAME,
    })
    const [{ database }, { auth }] = await Promise.all([import('@/core/db'), import('@/core/auth/auth')])
    const result = await bootstrapAdmin({ database, auth }, config)
    console.log(`${result.action === 'created' ? 'Created' : 'Promoted existing'} admin user: ${result.user.email}`)
    if (result.action === 'promoted') console.log('Existing user password was not changed.')
    await database.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

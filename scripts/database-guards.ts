import { env } from '@/core/config/env'

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function assertLocalDatabaseTarget(options: { allowE2E?: boolean } = {}): string {
  const allowedModes = options.allowE2E ? ['local', 'e2e'] : ['local']
  if (!allowedModes.includes(env.DB_MODE)) {
    throw new Error(
      `This database command only supports ${allowedModes.join(' or ')} mode. Refusing to target production.`,
    )
  }

  const databaseUrl = env.DATABASE_URL
  const hostname = new URL(databaseUrl).hostname
  if (!LOCAL_DATABASE_HOSTS.has(hostname)) {
    throw new Error(`Refusing to target non-local database host "${hostname}".`)
  }

  return databaseUrl
}

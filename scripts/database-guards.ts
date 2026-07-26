import { env } from '@/core/config/env'

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
export const PRODUCTION_DATABASE_CONFIRMATION = 'cli-double-confirmed'

export function assertDatabaseTarget(options: { allowE2E?: boolean; allowProduction?: boolean } = {}): string {
  const allowedModes = ['local', ...(options.allowE2E ? ['e2e'] : []), ...(options.allowProduction ? ['prod'] : [])]
  if (!allowedModes.includes(env.DB_MODE)) {
    throw new Error(`This database command only supports ${allowedModes.join(' or ')} mode.`)
  }

  if (env.DB_MODE === 'prod' && process.env.PRODUCTION_DATABASE_CONFIRMATION !== PRODUCTION_DATABASE_CONFIRMATION) {
    throw new Error('Production database access is available only after double confirmation in the CLI menu.')
  }

  const databaseUrl = env.DATABASE_URL
  const hostname = new URL(databaseUrl).hostname
  if (env.DB_MODE !== 'prod' && !LOCAL_DATABASE_HOSTS.has(hostname)) {
    throw new Error(`Refusing to target non-local database host "${hostname}".`)
  }

  return databaseUrl
}

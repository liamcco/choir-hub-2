import 'dotenv/config'

import { spawnSync } from 'node:child_process'
import { reset } from 'drizzle-seed'
import { db, sql } from '@/core/db'
import * as schema from '@/drizzle/schema'

if (process.env.DB_MODE !== 'local' && process.env.DB_MODE !== 'e2e' && process.env.DB_MODE !== 'prod') {
  console.error('Database reset requires DB_MODE=local, e2e, or prod.')
  process.exit(1)
}

async function main(): Promise<void> {
  try {
    await reset(db, schema)
    const migrate = spawnSync('bun', ['x', 'drizzle-kit', 'migrate'], { stdio: 'inherit', env: process.env })
    if (migrate.error) throw migrate.error
    if (migrate.status !== 0)
      throw new Error(`bun x drizzle-kit migrate exited with code ${migrate.status ?? 'unknown'}.`)
    console.log(
      `${process.env.DB_MODE === 'prod' ? 'Production' : process.env.DB_MODE === 'e2e' ? 'E2E' : 'Local'} database reset.`,
    )
  } finally {
    await sql.end()
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

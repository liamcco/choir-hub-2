import 'dotenv/config'

import { spawnSync } from 'node:child_process'
import { reset } from 'drizzle-seed'
import { db, sql } from '@/drizzle/db'
import * as schema from '@/drizzle/schema'

if (process.env.DB_MODE !== 'local' && process.env.DB_MODE !== 'prod') {
  console.error('Database reset requires DB_MODE=local or DB_MODE=prod.')
  process.exit(1)
}

async function main(): Promise<void> {
  try {
    await reset(db, schema)
    const push = spawnSync('bun', ['run', 'db:push'], { stdio: 'inherit', env: process.env })
    if (push.error) throw push.error
    if (push.status !== 0) throw new Error(`bun run db:push exited with code ${push.status ?? 'unknown'}.`)
    console.log(`${process.env.DB_MODE === 'prod' ? 'Production' : 'Local'} database reset.`)
  } finally {
    await sql.end()
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

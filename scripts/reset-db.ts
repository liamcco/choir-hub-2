import 'dotenv/config'

import { spawnSync } from 'node:child_process'
import postgres from 'postgres'
import { assertDatabaseTarget } from './database-guards'

const databaseUrl = assertDatabaseTarget({ allowE2E: true, allowProduction: true })
const sql = postgres(databaseUrl)

async function main(): Promise<void> {
  try {
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE')
    await sql.unsafe('CREATE SCHEMA public')
    await sql.unsafe('GRANT ALL ON SCHEMA public TO public')

    const push = spawnSync('bun', ['x', 'drizzle-kit', 'push'], { stdio: 'inherit', env: process.env })
    if (push.error) throw push.error
    if (push.status !== 0) {
      throw new Error(`bun x drizzle-kit push exited with code ${push.status ?? 'unknown'}.`)
    }

    const databaseName = process.env.DB_MODE === 'prod' ? 'Production' : process.env.DB_MODE === 'e2e' ? 'E2E' : 'Local'
    console.log(`${databaseName} database reset.`)
  } finally {
    await sql.end()
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

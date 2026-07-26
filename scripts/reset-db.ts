import 'dotenv/config'

import { spawnSync } from 'node:child_process'
import postgres from 'postgres'
import { assertLocalDatabaseTarget } from './database-guards'

const databaseUrl = assertLocalDatabaseTarget({ allowE2E: true })
const sql = postgres(databaseUrl)

async function main(): Promise<void> {
  try {
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE')
    await sql.unsafe('CREATE SCHEMA public')
    await sql.unsafe('GRANT ALL ON SCHEMA public TO public')

    const migrate = spawnSync('bun', ['x', 'drizzle-kit', 'migrate'], { stdio: 'inherit', env: process.env })
    if (migrate.error) throw migrate.error
    if (migrate.status !== 0) {
      throw new Error(`bun x drizzle-kit migrate exited with code ${migrate.status ?? 'unknown'}.`)
    }

    console.log(`${process.env.DB_MODE === 'e2e' ? 'E2E' : 'Local'} database reset.`)
  } finally {
    await sql.end()
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

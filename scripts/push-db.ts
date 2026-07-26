import 'dotenv/config'

import { spawnSync } from 'node:child_process'
import { assertLocalDatabaseTarget } from './database-guards'

assertLocalDatabaseTarget()

const push = spawnSync('bun', ['x', 'drizzle-kit', 'push'], { stdio: 'inherit', env: process.env })
if (push.error) throw push.error
if (push.status !== 0) {
  throw new Error(`bun x drizzle-kit push exited with code ${push.status ?? 'unknown'}.`)
}

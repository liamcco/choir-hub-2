import 'dotenv/config'

import { db, sql } from '@/core/db'
import { seedE2E } from '@/drizzle/seeds/e2e'

if (process.env.DB_MODE !== 'e2e') {
  throw new Error('E2E seed requires DB_MODE=e2e.')
}

try {
  await seedE2E(db)
  console.log('Completed E2E seed.')
} finally {
  await sql.end()
}

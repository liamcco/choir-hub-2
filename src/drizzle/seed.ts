import 'dotenv/config'

import { db, sql } from '@/core/db'

import { seedFoundation } from './seeds/foundation'

async function main(): Promise<void> {
  try {
    await seedFoundation(db)
    console.log('Completed production foundation seed.')
  } finally {
    await sql.end()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })

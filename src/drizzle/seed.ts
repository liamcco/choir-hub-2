import 'dotenv/config'

import { database } from '@/core/db'

import { seedFoundation } from './seeds/foundation'

async function main(): Promise<void> {
  try {
    await seedFoundation(database)
    console.log('Completed production foundation seed.')
  } finally {
    await database.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })

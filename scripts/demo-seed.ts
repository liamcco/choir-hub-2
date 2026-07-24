import 'dotenv/config'

import { database } from '@/core/db'

import { seedDemo } from '@/drizzle/seeds/demo'

async function main(): Promise<void> {
  try {
    await seedDemo(database)
    console.log('Completed demo seed.')
  } finally {
    await database.$disconnect()
  }
}

void main()

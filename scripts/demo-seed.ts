import 'dotenv/config'

import { db, sql } from '@/core/db'

import { seedDemo } from '@/drizzle/seeds/demo'

async function main(): Promise<void> {
  try {
    await seedDemo(db)
    console.log('Completed demo seed.')
  } finally {
    await sql.end()
  }
}

void main()

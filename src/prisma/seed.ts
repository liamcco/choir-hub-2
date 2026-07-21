import 'dotenv/config'

import { prisma } from '@/core/db'

import { seedFoundation } from './seeds/foundation'

async function main(): Promise<void> {
  try {
    await seedFoundation(prisma)
    console.log('Completed production foundation seed.')
  } finally {
    await prisma.$disconnect()
  }
}

void main()

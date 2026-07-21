import 'dotenv/config'

import { prisma } from '@/core/db'

import { seedDemo } from '@/prisma/seeds/demo'

async function main(): Promise<void> {
  try {
    await seedDemo(prisma)
    console.log('Completed demo seed.')
  } finally {
    await prisma.$disconnect()
  }
}

void main()

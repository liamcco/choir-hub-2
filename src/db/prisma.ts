import { PrismaPg } from '@prisma/adapter-pg'

import { isProduction } from '@/common/environment/environment'
import { PrismaClient } from '@/prisma/generated/client'

import fs from 'node:fs'

import path from 'node:path'

const ca = fs.readFileSync(
  path.join(process.cwd(), 'src/db/prod-ca-2021.crt'),

  'utf8',
)

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const logPrismaQueries = process.env.LOG_PRISMA === 'true'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logPrismaQueries ? ['query', 'error', 'warn'] : ['error', 'warn'],
    adapter: new PrismaPg({
      connectionString: process.env.POSTGRES_PRISMA_URL,
      ssl: {
        rejectUnauthorized: true,
        ca,
      },
    }),
  })

if (!isProduction) {
  globalForPrisma.prisma = prisma
}

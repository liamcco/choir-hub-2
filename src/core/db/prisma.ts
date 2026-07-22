import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/core/config/env'
import { isProduction } from '@/core/environment/environment'
import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const logPrismaQueries = env.LOG_PRISMA === 'true'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logPrismaQueries ? ['query', 'error', 'warn'] : ['error', 'warn'],
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
    }),
  })

if (!isProduction) {
  globalForPrisma.prisma = prisma
}

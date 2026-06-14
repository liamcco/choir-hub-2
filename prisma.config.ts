import { defineConfig, env } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'src/prisma/schema',
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    url: env('POSTGRES_PRISMA_URL'),
  },
})

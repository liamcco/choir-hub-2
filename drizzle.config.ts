import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/drizzle/schema/**/*.ts',
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DB_MODE === 'e2e'
        ? (process.env.DATABASE_URL_E2E ?? 'postgresql://postgres:mysecretpassword@localhost:5432/csk_e2e')
        : (process.env.DATABASE_URL ?? 'postgresql://postgres:mysecretpassword@localhost:5432/csk_db'),
  },
})

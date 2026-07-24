import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/drizzle/schema/**/*.ts',
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgresql://postgres:mysecretpassword@localhost:5432/csk_db' },
})

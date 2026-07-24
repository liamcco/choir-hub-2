import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/core/config/env'
import * as schema from './schema'

const globalForDb = global as unknown as { sql?: ReturnType<typeof postgres> }
export const sql = globalForDb.sql ?? postgres(env.DATABASE_URL)
if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql
export const db = drizzle(sql, { schema })

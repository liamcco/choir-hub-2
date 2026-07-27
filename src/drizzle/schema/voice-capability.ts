import { sql } from 'drizzle-orm'
import { check, index, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { voice } from './organization'

export const voiceCapability = pgTable(
  'VoiceCapability',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    voice: voice('voice').notNull(),
  },
  (table) => [
    unique('VoiceCapability_user_id_voice_key').on(table.userId, table.voice),
    index('VoiceCapability_user_id_idx').on(table.userId),
    check('VoiceCapability_fine_voice_check', sql`"voice"::text ~ '^(S|A|T|B)[12]$'`),
  ],
)

export type VoiceCapability = typeof voiceCapability.$inferSelect

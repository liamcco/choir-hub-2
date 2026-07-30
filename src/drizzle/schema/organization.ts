import { sql } from 'drizzle-orm'
import { check, index, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'

// TODO: Consider seperating into baseVoice / fineVoice
export const voice = pgEnum('Voice', ['S', 'S1', 'S2', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2'])

function datedPeriodColumns() {
  return {
    startsAt: timestamp('startsAt').notNull(),
    endsAt: timestamp('endsAt'),
  }
}

export const choirMembership = pgTable(
  'ChoirMembership',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    choirId: text('choirId').notNull(),
    ...datedPeriodColumns(),
  },
  (table) => [
    unique('ChoirMembership_user_id_starts_at_key').on(table.userId, table.startsAt),
    index('ChoirMembership_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('ChoirMembership_choir_id_ends_at_idx').on(table.choirId, table.endsAt),
    check('ChoirMembership_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

export const sectionPlacement = pgTable(
  'SectionPlacement',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    sectionId: text('sectionId').notNull(),
    voice: voice('voice').notNull(),
    ...datedPeriodColumns(),
  },
  (table) => [
    unique('SectionPlacement_user_id_starts_at_key').on(table.userId, table.startsAt),
    index('SectionPlacement_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('SectionPlacement_section_id_ends_at_idx').on(table.sectionId, table.endsAt),
    check('SectionPlacement_fine_voice_check', sql`"voice"::text ~ '^(S|A|T|B)[12]$'`),
    check('SectionPlacement_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

export const groupMembership = pgTable(
  'GroupMembership',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    groupId: text('groupId').notNull(),
    ...datedPeriodColumns(),
  },
  (table) => [
    unique('GroupMembership_user_id_group_id_starts_at_key').on(table.userId, table.groupId, table.startsAt),
    index('GroupMembership_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('GroupMembership_group_id_ends_at_idx').on(table.groupId, table.endsAt),
    check('GroupMembership_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

export const positionAssignment = pgTable(
  'PositionAssignment',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    positionId: text('positionId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...datedPeriodColumns(),
  },
  (table) => [
    unique('PositionAssignment_position_id_starts_at_key').on(table.positionId, table.startsAt),
    index('PositionAssignment_position_id_ends_at_idx').on(table.positionId, table.endsAt),
    index('PositionAssignment_user_id_ends_at_idx').on(table.userId, table.endsAt),
    check('PositionAssignment_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

// PostgreSQL-specific temporal guarantees and catalog-aware relationship
// validation live in the migration and application services respectively.
export const schema = {
  user,
  choirMembership,
  sectionPlacement,
  groupMembership,
  positionAssignment,
}

export type ChoirMembership = typeof choirMembership.$inferSelect
export type SectionPlacement = typeof sectionPlacement.$inferSelect
export type GroupMembership = typeof groupMembership.$inferSelect
export type PositionAssignment = typeof positionAssignment.$inferSelect

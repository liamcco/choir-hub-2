import { relations, sql } from 'drizzle-orm'
import { check, index, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const voiceType = pgEnum('VoiceType', ['S', 'S1', 'S2', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2'])
export const sectionVoiceType = pgEnum('SectionVoiceType', ['S1', 'S2', 'A1', 'A2', 'T1', 'T2', 'B1', 'B2'])
export const groupKind = pgEnum('GroupKind', ['committee', 'board'])
export const groupScopeType = pgEnum('GroupScopeType', ['csk', 'choir'])
export const positionScopeTargetType = pgEnum('PositionScopeTargetType', ['csk', 'choir', 'section', 'group'])

export const choir = pgTable('Choir', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  shortName: text('shortName').notNull().unique(),
})

export const section = pgTable(
  'Section',
  {
    id: text('id').primaryKey(),
    choirId: text('choirId')
      .notNull()
      .references(() => choir.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    voiceType: sectionVoiceType('voiceType').notNull(),
  },
  (table) => [
    unique('Section_choir_id_name_key').on(table.choirId, table.name),
    unique('Section_choir_id_voice_type_key').on(table.choirId, table.voiceType),
    index('Section_choir_id_idx').on(table.choirId),
  ],
)

export const choirMembership = pgTable(
  'ChoirMembership',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    choirId: text('choirId')
      .notNull()
      .references(() => choir.id, { onDelete: 'restrict' }),
    startsAt: timestamp('startsAt').notNull(),
    endsAt: timestamp('endsAt'),
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
    sectionId: text('sectionId')
      .notNull()
      .references(() => section.id, { onDelete: 'restrict' }),
    startsAt: timestamp('startsAt').notNull(),
    endsAt: timestamp('endsAt'),
  },
  (table) => [
    unique('SectionPlacement_user_id_starts_at_key').on(table.userId, table.startsAt),
    index('SectionPlacement_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('SectionPlacement_section_id_ends_at_idx').on(table.sectionId, table.endsAt),
    check('SectionPlacement_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

export const group = pgTable(
  'Group',
  {
    id: text('id').primaryKey(),
    kind: groupKind('kind').notNull(),
    name: text('name').notNull(),
    scopeType: groupScopeType('scopeType').notNull(),
    scopeKey: text('scopeKey').notNull(),
    choirId: text('choirId').references(() => choir.id, { onDelete: 'restrict' }),
  },
  (table) => [
    unique('Group_scope_key_name_key').on(table.scopeKey, table.name),
    index('Group_choir_id_idx').on(table.choirId),
    check(
      'Group_valid_scope_check',
      sql`("scopeType" = 'csk' AND "scopeKey" = 'csk' AND "choirId" IS NULL) OR ("scopeType" = 'choir' AND "scopeKey" = "choirId" AND "choirId" IS NOT NULL)`,
    ),
  ],
)

export const groupMembership = pgTable(
  'GroupMembership',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    groupId: text('groupId')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    startsAt: timestamp('startsAt').notNull(),
    endsAt: timestamp('endsAt'),
  },
  (table) => [
    unique('GroupMembership_user_id_group_id_starts_at_key').on(table.userId, table.groupId, table.startsAt),
    index('GroupMembership_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('GroupMembership_group_id_ends_at_idx').on(table.groupId, table.endsAt),
    check('GroupMembership_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

export const position = pgTable('Position', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
})

export const positionScope = pgTable(
  'PositionScope',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    positionId: text('positionId')
      .notNull()
      .references(() => position.id, { onDelete: 'cascade' }),
    targetType: positionScopeTargetType('targetType').notNull(),
    targetKey: text('targetKey').notNull(),
    choirId: text('choirId').references(() => choir.id, { onDelete: 'restrict' }),
    sectionId: text('sectionId').references(() => section.id, { onDelete: 'restrict' }),
    groupId: text('groupId').references(() => group.id, { onDelete: 'restrict' }),
  },
  (table) => [
    unique('PositionScope_position_id_target_key_key').on(table.positionId, table.targetType, table.targetKey),
    index('PositionScope_target_key_idx').on(table.targetType, table.targetKey),
    check(
      'PositionScope_valid_target_check',
      sql`("targetType" = 'csk' AND "targetKey" = 'csk' AND "choirId" IS NULL AND "sectionId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'choir' AND "targetKey" = "choirId" AND "choirId" IS NOT NULL AND "sectionId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'section' AND "targetKey" = "sectionId" AND "sectionId" IS NOT NULL AND "choirId" IS NULL AND "groupId" IS NULL) OR ("targetType" = 'group' AND "targetKey" = "groupId" AND "groupId" IS NOT NULL AND "choirId" IS NULL AND "sectionId" IS NULL)`,
    ),
  ],
)

export const positionAssignment = pgTable(
  'PositionAssignment',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    positionId: text('positionId')
      .notNull()
      .references(() => position.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    startsAt: timestamp('startsAt').notNull(),
    endsAt: timestamp('endsAt'),
  },
  (table) => [
    unique('PositionAssignment_position_id_starts_at_key').on(table.positionId, table.startsAt),
    index('PositionAssignment_position_id_ends_at_idx').on(table.positionId, table.endsAt),
    index('PositionAssignment_user_id_ends_at_idx').on(table.userId, table.endsAt),
    check('PositionAssignment_valid_period_check', sql`"endsAt" IS NULL OR "endsAt" > "startsAt"`),
  ],
)

// Issue 07 must add PostgreSQL range exclusion constraints for the half-open
// periods on ChoirMembership(user), SectionPlacement(user),
// GroupMembership(user, group), and PositionAssignment(position), plus the
// matching partial/current indexes. It must also add the cross-table guard for
// Committee-only GroupMembership and the SectionPlacement/ChoirMembership
// coverage rule. Drizzle checks and application modules are intentionally not
// treated as the final concurrency guarantee.

export const schema = {
  user,
  choir,
  section,
  choirMembership,
  sectionPlacement,
  group,
  groupMembership,
  position,
  positionScope,
  positionAssignment,
}

export const GroupKind = { COMMITTEE: 'COMMITTEE', BOARD: 'BOARD' } as const
export type GroupKind = keyof typeof GroupKind
export type Choir = typeof choir.$inferSelect
export type Section = typeof section.$inferSelect
export type ChoirMembership = typeof choirMembership.$inferSelect
export type SectionPlacement = typeof sectionPlacement.$inferSelect
export type Group = typeof group.$inferSelect
export type GroupMembership = typeof groupMembership.$inferSelect
export type Position = typeof position.$inferSelect
export type PositionScope = typeof positionScope.$inferSelect
export type PositionAssignment = typeof positionAssignment.$inferSelect

export const choirRelations = relations(choir, ({ many }) => ({
  sections: many(section),
  memberships: many(choirMembership),
}))
export const sectionRelations = relations(section, ({ one, many }) => ({
  choir: one(choir, { fields: [section.choirId], references: [choir.id] }),
  placements: many(sectionPlacement),
}))
export const groupRelations = relations(group, ({ one, many }) => ({
  choir: one(choir, { fields: [group.choirId], references: [choir.id] }),
  memberships: many(groupMembership),
  scopes: many(positionScope),
}))

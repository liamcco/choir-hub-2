import { relations, sql } from 'drizzle-orm'
import { foreignKey, index, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const groupKind = pgEnum('GroupKind', ['choir', 'section', 'committee', 'board', 'project'])

export const group = pgTable(
  'Group',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    kind: groupKind('kind').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    parentGroupId: text('parentGroupId'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('Group_parent_group_id_idx').on(table.parentGroupId),
    unique('Group_sibling_name_unique').on(table.parentGroupId, table.name),
    foreignKey({
      columns: [table.parentGroupId],
      foreignColumns: [table.id],
      name: 'Group_parent_group_id_fkey',
    }).onDelete('set null'),
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
    startsAt: timestamp('startsAt').notNull().defaultNow(),
    endsAt: timestamp('endsAt'),
  },
  (table) => [
    unique('GroupMembership_user_id_group_id_starts_at_key').on(table.userId, table.groupId, table.startsAt),
    index('GroupMembership_user_id_ends_at_idx').on(table.userId, table.endsAt),
    index('GroupMembership_group_id_ends_at_idx').on(table.groupId, table.endsAt),
  ],
)

export const position = pgTable('Position', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const positionScope = pgTable(
  'PositionScope',
  {
    positionId: text('positionId')
      .notNull()
      .references(() => position.id, { onDelete: 'cascade' }),
    groupId: text('groupId')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [unique().on(table.positionId, table.groupId)],
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
    startsAt: timestamp('startsAt').notNull().defaultNow(),
    endsAt: timestamp('endsAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.positionId, table.startsAt),
    index('PositionAssignment_position_id_ends_at_idx').on(table.positionId, table.endsAt),
    index('PositionAssignment_user_id_ends_at_idx').on(table.userId, table.endsAt),
  ],
)

export const schema = { user, group, groupMembership, position, positionScope, positionAssignment }
export const GroupKind = {
  CHOIR: 'CHOIR',
  SECTION: 'SECTION',
  COMMITTEE: 'COMMITTEE',
  BOARD: 'BOARD',
  PROJECT: 'PROJECT',
} as const
export type GroupKind = keyof typeof GroupKind
export type Group = Omit<typeof group.$inferSelect, 'kind'> & { kind: GroupKind }
export type GroupMembership = typeof groupMembership.$inferSelect
export type Position = typeof position.$inferSelect
export type PositionScope = typeof positionScope.$inferSelect
export type PositionAssignment = typeof positionAssignment.$inferSelect

export const groupRelations = relations(group, ({ one }) => ({
  parentGroup: one(group, { fields: [group.parentGroupId], references: [group.id] }),
}))

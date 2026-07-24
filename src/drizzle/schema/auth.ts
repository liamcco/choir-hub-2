import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const memberStatus = pgEnum('MemberStatus', ['active', 'passive', 'former'])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: false })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  username: text('username').unique(),
  displayUsername: text('displayUsername'),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires', { withTimezone: false }),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false),
  status: memberStatus('status').notNull().default('active'),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt', { withTimezone: false }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonatedBy'),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: false }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: false }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: false }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const twoFactor = pgTable(
  'twoFactor',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backupCodes').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    verified: boolean('verified').default(true),
    failedVerificationCount: integer('failedVerificationCount').default(0),
    lockedUntil: timestamp('lockedUntil', { withTimezone: false }),
  },
  (table) => [index('twoFactor_secret_idx').on(table.secret), index('twoFactor_user_id_idx').on(table.userId)],
)

export const passkey = pgTable(
  'passkey',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('publicKey').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text('credentialID').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('deviceType').notNull(),
    backedUp: boolean('backedUp').notNull(),
    transports: text('transports'),
    createdAt: timestamp('createdAt', { withTimezone: false }),
    aaguid: text('aaguid'),
  },
  (table) => [index('passkey_user_id_idx').on(table.userId), index('passkey_credential_id_idx').on(table.credentialID)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
  passkeys: many(passkey),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, { fields: [twoFactor.userId], references: [user.id] }),
}))

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, { fields: [passkey.userId], references: [user.id] }),
}))

export const MemberStatus = { ACTIVE: 'ACTIVE', PASSIVE: 'PASSIVE', FORMER: 'FORMER' } as const
export type MemberStatus = keyof typeof MemberStatus
export type User = Omit<typeof user.$inferSelect, 'status'> & { status: MemberStatus }
export type NewUser = typeof user.$inferInsert

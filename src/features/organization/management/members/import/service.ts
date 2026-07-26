import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { db } from '@/core/db'
import { audit } from '@/core/logging'
import { choirMembership, sectionPlacement, user } from '@/drizzle/schema'
import { type ImportedUser, parseUserImportCsv } from './csv'

const ACTIVATION_PATH = '/activate'

export async function validateUserImport(csv: string) {
  const result = parseUserImportCsv(csv)
  if (result.errors.length === 0) {
    const existing = await db.select({ email: user.email }).from(user)
    const existingEmails = new Set(existing.map((item) => item.email.toLowerCase()))
    for (const row of result.rows) {
      if (existingEmails.has(row.email)) result.errors.push({ row: row.row, message: 'Email is already registered.' })
    }
  }
  return result
}

export async function createImportedUsers(rows: ImportedUser[], actorUserId: string) {
  const created: { id: string; email: string; invitationSent: boolean; name: string }[] = []
  const createdUserIds: string[] = []
  const createdAt = new Date()
  try {
    for (const row of rows) {
      const result = await auth.api.createUser({
        headers: await headers(),
        body: { name: row.name.trim(), email: row.email, role: 'user', data: { emailVerified: false } },
      })
      createdUserIds.push(result.user.id)
      const member = await db
        .update(user)
        .set({ status: 'active', updatedAt: createdAt })
        .where(eq(user.id, result.user.id))
        .returning({ id: user.id })
      if (!member[0]) throw new Error('The user could not be saved.')
      if (row.placement) {
        await db
          .insert(choirMembership)
          .values({ userId: result.user.id, choirId: row.placement.choirId, startsAt: createdAt })
        await db.insert(sectionPlacement).values({
          userId: result.user.id,
          sectionId: row.placement.sectionId,
          voice: row.placement.voice,
          startsAt: createdAt,
        })
      }
      created.push({ id: result.user.id, email: row.email, invitationSent: false, name: row.name })
      audit.adminActionCompleted({ actorUserId, action: 'user.create', subject: { type: 'user', id: result.user.id } })
    }
  } catch (error) {
    const requestHeaders = await headers()
    await Promise.all(
      createdUserIds.map((userId) =>
        auth.api.removeUser({ headers: requestHeaders, body: { userId } }).catch(() => undefined),
      ),
    )
    throw error
  }
  return Promise.all(created.map(async (item) => ({ ...item, invitationSent: await sendInvitation(item.email) })))
}

export async function sendInvitation(email: string) {
  try {
    await auth.api.signInMagicLink({
      headers: await headers(),
      body: { email, callbackURL: ACTIVATION_PATH, errorCallbackURL: ACTIVATION_PATH },
    })
    return true
  } catch {
    return false
  }
}

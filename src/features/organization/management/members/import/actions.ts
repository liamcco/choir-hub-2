'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { createImportedUsers, sendInvitation, validateUserImport } from './service'

type ImportActionState =
  | { success: true; count: number; failedEmails: string[] }
  | { success: false; validation: Awaited<ReturnType<typeof validateUserImport>> }

export async function validateUserImportAction(_state: unknown, formData: FormData) {
  await requireAdmin()
  const csv = String(formData.get('csv') ?? '')
  return validateUserImport(csv)
}

export async function createImportedUsersAction(
  _state: ImportActionState | null,
  formData: FormData,
): Promise<ImportActionState> {
  const actor = await requireAdmin()
  const validation = await validateUserImport(String(formData.get('csv') ?? ''))
  if (validation.errors.length) return { success: false, validation }
  const created = await createImportedUsers(validation.rows, actor.userId)
  const failed = created.filter((item) => !item.invitationSent)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'user.import.completed',
    subject: { type: 'user-import', id: `${created.length}` },
  })
  revalidatePath(ROUTES.adminUsers)
  return { success: true, count: created.length, failedEmails: failed.map((item) => item.email) }
}

export async function resendInvitationAction(userId: string) {
  const actor = await requireAdmin()
  const result = await import('@/core/db').then(async ({ db }) => {
    const { user } = await import('@/drizzle/schema')
    const { eq } = await import('drizzle-orm')
    const rows = await db
      .select({ email: user.email, emailVerified: user.emailVerified })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    return rows[0]
  })
  if (!result || result.emailVerified) return { success: false, message: 'This user no longer needs an invitation.' }
  const sent = await sendInvitation(result.email)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'user.invitation.resend',
    subject: { type: 'user', id: userId },
  })
  return sent
    ? { success: true, message: 'Invitation sent.' }
    : { success: false, message: 'The invitation could not be sent.' }
}

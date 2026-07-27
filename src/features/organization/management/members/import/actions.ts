'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { userOnboarding } from '../onboarding'
import { toOnboardingPlans, validateUserImport } from './service'

type ImportActionState =
  | {
      success: true
      count: number
      failedEmails: string[]
      failedRows: { row?: number; email: string; message: string; cleanup: 'not-needed' | 'completed' | 'failed' }[]
    }
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
  const onboarding = await userOnboarding.onboardBatch(toOnboardingPlans(validation.rows), actor.userId)
  if (onboarding.validationErrors.length) {
    return {
      success: false,
      validation: { ...validation, errors: [...validation.errors, ...onboarding.validationErrors] },
    }
  }
  const created = onboarding.outcomes.filter((item) => item.status === 'created')
  const failed = onboarding.outcomes.filter((item) => item.status === 'failed')
  const failedInvitations = created.filter((item) => !item.invitationSent)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'user.import.completed',
    subject: { type: 'user-import', id: `${created.length}` },
  })
  revalidatePath(ROUTES.adminUsers)
  return {
    success: true,
    count: created.length,
    failedEmails: failedInvitations.map((item) => item.email),
    failedRows: failed.map(({ row, email, message, cleanup }) => ({ row, email, message, cleanup })),
  }
}

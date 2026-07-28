'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { MemberStatus } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import { transferSchema } from './schemas'

function parseTransferFormData(formData: FormData) {
  return transferSchema.safeParse({
    userId: String(formData.get('userId')),
    choirId: String(formData.get('choirId')),
    sectionId: normalizeOptionalFormValue(formData.get('sectionId')),
    voice: normalizeOptionalFormValue(formData.get('voice')),
  })
}

function normalizeOptionalFormValue(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? '')
  return stringValue === '' || stringValue === 'none' ? undefined : stringValue
}

export async function transferPlacementAction(_previous: unknown, formData: FormData) {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })
  const parsed = parseTransferFormData(formData)
  if (!parsed.success) return { success: false, message: z.prettifyError(parsed.error) }
  try {
    await organizationService.homePlacement.transfer(parsed.data)
  } catch (error) {
    return handleFormError(error)
  }
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'placement.transfer',
    subject: { type: 'user', id: parsed.data.userId },
  })
  revalidatePath(ROUTES.adminPlacement)
  revalidatePath(ROUTES.adminUsers)
  return { success: true, message: 'Placement updated.' }
}

export async function updatePlacementStatusAction(userId: string, _previous: unknown, formData: FormData) {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })
  const status = String(formData.get('status'))
  if (!(status in MemberStatus)) return { success: false, message: 'Choose a valid Member Status.' }
  await organizationService.users.updateMemberStatus(userId, status as keyof typeof MemberStatus)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'placement.updateMemberStatus',
    subject: { type: 'user', id: userId },
  })
  revalidatePath(ROUTES.adminPlacement)
  revalidatePath(ROUTES.adminUsers)
  return { success: true, message: 'Member Status updated.' }
}

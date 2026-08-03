'use server'

import { revalidatePath } from 'next/cache'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { organizationService } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { PlacementStatusFormSchema, TransferPlacementFormSchema } from './schemas'

export type PlacementStatusFormState = FormState<typeof PlacementStatusFormSchema>
export type TransferPlacementFormState = FormState<typeof TransferPlacementFormSchema>

export async function transferPlacementAction(
  _previous: TransferPlacementFormState,
  formData: FormData,
): Promise<TransferPlacementFormState> {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })
  const parsed = parseFormData(TransferPlacementFormSchema, formData)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.fieldErrors,
    }
  }

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

export async function updatePlacementStatusAction(
  userId: string,
  _previous: PlacementStatusFormState,
  formData: FormData,
): Promise<PlacementStatusFormState> {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })

  const parsed = parseFormData(PlacementStatusFormSchema, formData)

  if (!parsed.success) return { success: false, message: 'Choose a valid Member Status.' }

  await organizationService.users.updateMemberStatus(userId, parsed.data.status)

  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'placement.updateMemberStatus',
    subject: { type: 'user', id: userId },
  })

  revalidatePath(ROUTES.adminPlacement)
  revalidatePath(ROUTES.adminUsers)

  return { success: true, message: 'Member Status updated.' }
}

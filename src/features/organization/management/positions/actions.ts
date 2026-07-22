'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { organizationService } from '@/features/organization'
import { normalizeOptionalString } from '@/shared/formatting'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { PositionFormSchema } from './schemas'

export type PositionFormState = FormState<typeof PositionFormSchema> & { createdId?: string }

export async function createPositionAction(
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = PositionFormSchema.safeParse({
    name: formData.get('name'),
    description: normalizeOptionalString(String(formData.get('description'))),
    groupIds: formData.getAll('groupIds'),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  let position: Awaited<ReturnType<typeof organizationService.positions.create>>
  try {
    position = await organizationService.positions.create(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'position.create',
      subject: { type: 'position', id: position.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)

  return { success: true, message: 'Position successfully created.', createdId: position.id }
}

export async function updatePositionAction(
  positionId: string,
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = PositionFormSchema.safeParse({
    name: formData.get('name'),
    description: normalizeOptionalString(String(formData.get('description'))),
    groupIds: formData.getAll('groupIds'),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.positions.update(positionId, formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'position.update',
      subject: { type: 'position', id: positionId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)
  return { success: true, message: 'Position updated.' }

  // 5. Navigate
}

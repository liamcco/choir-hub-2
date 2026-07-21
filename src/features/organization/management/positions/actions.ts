'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ROUTES } from '@/core/navigation/site'
import { organizationService } from '@/features/organization'
import { normalizeOptionalString } from '@/shared/formatting'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { PositionFormSchema } from './schemas'

export type PositionFormState = FormState<typeof PositionFormSchema>

export async function createPositionAction(
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  // 1. Authenticate

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
    await organizationService.positions.create(formInput.data)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)
  return { success: true, message: 'Position created.' }

  // 5. Navigate
}

export async function updatePositionAction(
  positionId: string,
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  // 1. Authenticate

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
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)
  return { success: true, message: 'Position updated.' }

  // 5. Navigate
}

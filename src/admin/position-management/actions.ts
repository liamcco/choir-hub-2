'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { normalizeOptionalString } from '@/common/formatting'
import type { FormState } from '@/common/types/forms'
import { ROUTES } from '@/navigation/app-routes'
import { OrganizationOperationError, organizationService } from '@/organization'
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

function handleFormError(error: unknown): PositionFormState {
  if (error instanceof OrganizationOperationError) {
    return {
      success: false,
      message: error.message,
      fieldErrors: error.field ? { [error.field]: error.message } : undefined,
    }
  }
  throw error
}

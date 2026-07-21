'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ROUTES } from '@/core/navigation/site'
import { organizationService } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { CreatePositionAssignmentFormSchema, EndPositionAssignmentFormSchema } from './schemas'

export type CreatePositionAssignmentFormState = FormState<typeof CreatePositionAssignmentFormSchema>
export type EndPositionAssignmentFormState = FormState<typeof EndPositionAssignmentFormSchema>

export type PositionAssignmentFormState = CreatePositionAssignmentFormState | EndPositionAssignmentFormState

export async function createPositionAssignmentAction(
  _previousState: PositionAssignmentFormState,
  formData: FormData,
): Promise<CreatePositionAssignmentFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = CreatePositionAssignmentFormSchema.safeParse({
    memberId: String(formData.get('memberId')),
    positionId: String(formData.get('positionId')),
    startsAt: String(formData.get('startsAt')),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.positionAssignments.create(formInput.data)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositionAssignments)
  return { message: 'Position Assignment added.' }

  // 5. Navigate
}

export async function endPositionAssignmentAction(
  assignmentId: string,
  _previousState: PositionAssignmentFormState,
  formData: FormData,
): Promise<EndPositionAssignmentFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = EndPositionAssignmentFormSchema.safeParse({
    endsAt: String(formData.get('endsAt')),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.positionAssignments.end(assignmentId, formInput.data.endsAt)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositionAssignments)
  return { message: 'Position Assignment ended.' }

  // 5. Navigate
}

'use server'

import { revalidatePath } from 'next/cache'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { positionAssignment } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { CreatePositionAssignmentFormSchema, EndPositionAssignmentFormSchema } from './schemas'

export type CreatePositionAssignmentFormState = FormState<typeof CreatePositionAssignmentFormSchema>
export type EndPositionAssignmentFormState = FormState<typeof EndPositionAssignmentFormSchema>

export type CreatePositionAssignmentAction = (
  previousState: CreatePositionAssignmentFormState,
  formData: FormData,
) => Promise<CreatePositionAssignmentFormState>
export type EndPositionAssignmentAction = (
  assignmentId: string,
  previousState: EndPositionAssignmentFormState,
  formData: FormData,
) => Promise<EndPositionAssignmentFormState>

export type PositionAssignmentFormState = CreatePositionAssignmentFormState | EndPositionAssignmentFormState

export async function createPositionAssignmentAction(
  _previousState: CreatePositionAssignmentFormState,
  formData: FormData,
): Promise<CreatePositionAssignmentFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'positionAssignment', action: 'create' })

  // 2. Validate form data
  const formInput = parseFormData(CreatePositionAssignmentFormSchema, formData)

  if (!formInput.success) {
    return { success: false, fieldErrors: formInput.fieldErrors }
  }

  // 3. Mutate
  try {
    const assignment = await positionAssignment.start(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'positionAssignment.create',
      subject: { type: 'positionAssignment', id: assignment.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)
  revalidatePath(ROUTES.adminUsers)
  return { success: true, message: 'Position Assignment added.' }

  // 5. Navigate
}

export async function endPositionAssignmentAction(
  assignmentId: string,
  _previousState: EndPositionAssignmentFormState,
  formData: FormData,
): Promise<EndPositionAssignmentFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'positionAssignment', action: 'delete' })

  // 2. Validate form data
  const formInput = parseFormData(EndPositionAssignmentFormSchema, formData)

  if (!formInput.success) {
    return { success: false, fieldErrors: formInput.fieldErrors }
  }

  // 3. Mutate
  try {
    await positionAssignment.end(assignmentId, formInput.data.endsAt)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'positionAssignment.end',
      subject: { type: 'positionAssignment', id: assignmentId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositions)
  revalidatePath(ROUTES.adminUsers)
  return { success: true, message: 'Position Assignment ended.' }

  // 5. Navigate
}

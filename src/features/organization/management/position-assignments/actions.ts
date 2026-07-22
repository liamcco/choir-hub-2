'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { adminPositionPath, ROUTES } from '@/core/navigation/site'
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
  const actor = await requireCurrentUserPermission({ resource: 'positionAssignment', action: 'create' })

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
    const assignment = await organizationService.positionAssignments.create(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'positionAssignment.create',
      subject: { type: 'positionAssignment', id: assignment.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositionAssignments)
  revalidatePath(adminPositionPath(formInput.data.positionId))
  return { message: 'Position Assignment added.' }

  // 5. Navigate
}

export async function endPositionAssignmentAction(
  assignmentId: string,
  _previousState: PositionAssignmentFormState,
  formData: FormData,
): Promise<EndPositionAssignmentFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'positionAssignment', action: 'delete' })

  // 2. Validate form data
  const formInput = EndPositionAssignmentFormSchema.safeParse({
    endsAt: String(formData.get('endsAt')),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  let assignment: Awaited<ReturnType<typeof organizationService.positionAssignments.end>>
  try {
    assignment = await organizationService.positionAssignments.end(assignmentId, formInput.data.endsAt)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'positionAssignment.end',
      subject: { type: 'positionAssignment', id: assignmentId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminPositionAssignments)
  revalidatePath(adminPositionPath(assignment.positionId))
  return { message: 'Position Assignment ended.' }

  // 5. Navigate
}

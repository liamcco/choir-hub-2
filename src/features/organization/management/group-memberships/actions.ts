'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ROUTES } from '@/core/navigation/app-routes'
import { organizationService } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { CreateGroupMembershipFormSchema, EndGroupMembershipFormSchema } from './schemas'

export type CreateGroupMembershipFormState = FormState<typeof CreateGroupMembershipFormSchema>
export type EndGroupMembershipFormState = FormState<typeof EndGroupMembershipFormSchema>

export type GroupMembershipFormState = CreateGroupMembershipFormState | EndGroupMembershipFormState

export async function createGroupMembershipAction(
  _previousState: GroupMembershipFormState,
  formData: FormData,
): Promise<CreateGroupMembershipFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = CreateGroupMembershipFormSchema.safeParse({
    memberId: String(formData.get('memberId')),
    groupId: String(formData.get('groupId')),
    startsAt: String(formData.get('startsAt')),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.groupMemberships.create(formInput.data)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroupMemberships)
  return { message: 'Group Membership added.' }

  // 5. Navigate
}

export async function endGroupMembershipAction(
  membershipId: string,
  _previousState: GroupMembershipFormState,
  formData: FormData,
): Promise<EndGroupMembershipFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = EndGroupMembershipFormSchema.safeParse({
    endsAt: String(formData.get('endsAt')),
  })
  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.groupMemberships.end(membershipId, formInput.data.endsAt)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroupMemberships)
  return { message: 'Group Membership ended.' }

  // 5. Navigate
}

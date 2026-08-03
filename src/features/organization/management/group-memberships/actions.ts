'use server'

import { revalidatePath } from 'next/cache'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { groupMembership } from '@/features/organization'
import { handleFormError } from '@/shared/forms/errors'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { CreateGroupMembershipFormSchema, EndGroupMembershipFormSchema } from './schemas'

export type CreateGroupMembershipFormState = FormState<typeof CreateGroupMembershipFormSchema>
export type EndGroupMembershipFormState = FormState<typeof EndGroupMembershipFormSchema>

export type CreateGroupMembershipAction = (
  previousState: CreateGroupMembershipFormState,
  formData: FormData,
) => Promise<CreateGroupMembershipFormState>
export type EndGroupMembershipAction = (
  membershipId: string,
  previousState: EndGroupMembershipFormState,
  formData: FormData,
) => Promise<EndGroupMembershipFormState>

export type GroupMembershipFormState = CreateGroupMembershipFormState | EndGroupMembershipFormState

export async function createGroupMembershipAction(
  _previousState: CreateGroupMembershipFormState,
  formData: FormData,
): Promise<CreateGroupMembershipFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'groupMembership', action: 'create' })

  // 2. Validate form data
  const formInput = parseFormData(CreateGroupMembershipFormSchema, formData)

  if (!formInput.success) {
    return { success: false, fieldErrors: formInput.fieldErrors }
  }

  // 3. Mutate
  try {
    const membership = await groupMembership.start(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'groupMembership.create',
      subject: { type: 'groupMembership', id: membership.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminUsers)
  revalidatePath(ROUTES.adminGroups)
  return { success: true, message: 'Group Membership added.' }

  // 5. Navigate
}

export async function endGroupMembershipAction(
  membershipId: string,
  _previousState: EndGroupMembershipFormState,
  formData: FormData,
): Promise<EndGroupMembershipFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'groupMembership', action: 'delete' })

  // 2. Validate form data
  const formInput = parseFormData(EndGroupMembershipFormSchema, formData)
  if (!formInput.success) {
    return { success: false, fieldErrors: formInput.fieldErrors }
  }

  // 3. Mutate
  try {
    await groupMembership.end(membershipId, formInput.data.endsAt)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'groupMembership.end',
      subject: { type: 'groupMembership', id: membershipId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminUsers)
  revalidatePath(ROUTES.adminGroups)
  return { success: true, message: 'Group Membership ended.' }

  // 5. Navigate
}

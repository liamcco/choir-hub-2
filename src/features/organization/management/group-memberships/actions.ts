'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { adminGroupPath, adminMemberPath, ROUTES } from '@/core/navigation/site'
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
  const actor = await requireCurrentUserPermission({ resource: 'groupMembership', action: 'create' })

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
    const membership = await organizationService.groupMemberships.create(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'groupMembership.create',
      subject: { type: 'groupMembership', id: membership.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroupMemberships)
  revalidatePath(ROUTES.adminGroups)
  revalidatePath(adminGroupPath(formInput.data.groupId))
  revalidatePath(adminMemberPath(formInput.data.memberId))
  return { message: 'Group Membership added.' }

  // 5. Navigate
}

export async function endGroupMembershipAction(
  membershipId: string,
  _previousState: GroupMembershipFormState,
  formData: FormData,
): Promise<EndGroupMembershipFormState> {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'groupMembership', action: 'delete' })

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
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'groupMembership.end',
      subject: { type: 'groupMembership', id: membershipId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroupMemberships)
  revalidatePath(ROUTES.adminGroups)
  const groupId = formData.get('groupId')
  if (typeof groupId === 'string' && groupId) {
    revalidatePath(adminGroupPath(groupId))
  }
  const memberId = formData.get('memberId')
  if (typeof memberId === 'string' && memberId) {
    revalidatePath(adminMemberPath(memberId))
  }
  return { message: 'Group Membership ended.' }

  // 5. Navigate
}

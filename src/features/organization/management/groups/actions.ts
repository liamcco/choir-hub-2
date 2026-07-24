'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import type { GroupKind } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { normalizeOptionalString } from '@/shared/formatting'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { GroupFormSchema } from './schemas'

export type GroupFormState = FormState<typeof GroupFormSchema> & { createdId?: string }

export async function createGroupAction(_previousState: GroupFormState, formData: FormData): Promise<GroupFormState> {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = GroupFormSchema.safeParse({
    name: String(formData.get('name')),
    description: normalizeOptionalString(String(formData.get('description'))),
    kind: formData.get('kind') as GroupKind,
    parentGroupId: normalizeOptionalString(String(formData.get('parentGroupId'))),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  let group: Awaited<ReturnType<typeof organizationService.groups.create>>
  try {
    group = await organizationService.groups.create(formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'group.create',
      subject: { type: 'group', id: group.id },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroups)

  return { success: true, message: 'Group successfully created.', createdId: group.id }
}

export async function updateGroupAction(
  groupId: string,
  _previousState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = GroupFormSchema.safeParse({
    name: String(formData.get('name')),
    description: normalizeOptionalString(String(formData.get('description'))),
    kind: formData.get('kind') as GroupKind,
    parentGroupId: normalizeOptionalString(String(formData.get('parentGroupId'))),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  try {
    await organizationService.groups.update(groupId, formInput.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'group.update',
      subject: { type: 'group', id: groupId },
    })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroups)

  return { success: true, message: 'Group updated.' }

  // 5. Navigate
}

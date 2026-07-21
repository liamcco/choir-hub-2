'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ROUTES } from '@/core/navigation/site'
import { organizationService } from '@/features/organization'
import type { GroupKind } from '@/prisma/generated/client'
import { normalizeOptionalString } from '@/shared/formatting'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { GroupFormSchema } from './schemas'

export type GroupFormState = FormState<typeof GroupFormSchema>

export async function createGroupAction(_previousState: GroupFormState, formData: FormData): Promise<GroupFormState> {
  // 1. Authenticate

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
    await organizationService.groups.create(formInput.data)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroups)
  return { success: true, message: 'Group created.' }

  // 5. Navigate
}

export async function updateGroupAction(
  groupId: string,
  _previousState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  // 1. Authenticate

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
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminGroups)
  return { success: true, message: 'Group updated.' }

  // 5. Navigate
}

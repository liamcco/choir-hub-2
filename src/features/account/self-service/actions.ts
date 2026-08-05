'use server'

import { refresh } from 'next/cache'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { PasswordChangeInputSchema, UsernameChangeInputSchema } from './schemas'
import { changePassword, changeUsername } from './service'

type PasswordChangeActionState = FormState<typeof PasswordChangeInputSchema>

export async function changePasswordAction(
  _previousState: PasswordChangeActionState,
  formData: FormData,
): Promise<PasswordChangeActionState> {
  // 1. Authenticate

  // 2. Validate form data
  const validatedFormData = parseFormData(PasswordChangeInputSchema, formData)

  if (!validatedFormData.success) {
    return { success: false, fieldErrors: validatedFormData.fieldErrors }
  }

  // 3. Mutate
  return changePassword({
    currentPassword: validatedFormData.data.currentPassword,
    newPassword: validatedFormData.data.newPassword,
  })

  // 4. Invalidate
  // 5. Navigate
}

type UsernameChangeActionState = FormState<typeof UsernameChangeInputSchema>

export async function changeUsernameAction(
  _previousState: UsernameChangeActionState,
  formData: FormData,
): Promise<UsernameChangeActionState> {
  // 1. Authenticate

  // 2. Validate form data
  const validatedFormData = parseFormData(UsernameChangeInputSchema, formData)

  if (!validatedFormData.success) {
    return { success: false, fieldErrors: validatedFormData.fieldErrors }
  }

  // 3. Mutate
  const result = await changeUsername({ username: validatedFormData.data.username })
  if (result.success) refresh()
  return result

  // 4. Invalidate
  // 5. Navigate
}

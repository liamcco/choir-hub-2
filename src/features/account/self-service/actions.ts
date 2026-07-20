'use server'

import { z } from 'zod'
import type { FormState } from '@/shared/forms/types'
import { PasswordChangeInputSchema } from './schemas'
import { changePassword } from './service'

export type PasswordChangeFormState = FormState<typeof PasswordChangeInputSchema>

export async function changePasswordAction(
  _previousState: PasswordChangeFormState,
  formData: FormData,
): Promise<PasswordChangeFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = PasswordChangeInputSchema.safeParse({
    currentPassword: String(formData.get('currentPassword')),
    newPassword: String(formData.get('newPassword')),
    confirmPassword: String(formData.get('confirmPassword')),
  })

  if (!formInput.success) {
    return { success: false, fieldErrors: z.flattenError(formInput.error).fieldErrors }
  }

  // 3. Mutate
  const result = await changePassword({
    currentPassword: formInput.data.currentPassword,
    newPassword: formInput.data.newPassword,
  })
  return { success: true, message: result.message }

  // 4. Invalidate
  // 5. Navigate
}

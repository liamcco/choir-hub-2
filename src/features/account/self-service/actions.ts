'use server'

import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { PasswordChangeInputSchema } from './schemas'
import { changePassword } from './service'

type PasswordChangeFormState = FormState<typeof PasswordChangeInputSchema>

export async function changePasswordAction(
  _previousState: PasswordChangeFormState,
  formData: FormData,
): Promise<PasswordChangeFormState> {
  // 1. Authenticate

  // 2. Validate form data
  const validatedFormData = parseFormData(PasswordChangeInputSchema, formData)

  if (!validatedFormData.success) {
    return { success: false, fieldErrors: validatedFormData.fieldErrors }
  }

  // 3. Mutate
  const result = await changePassword({
    currentPassword: validatedFormData.data.currentPassword,
    newPassword: validatedFormData.data.newPassword,
  })
  return { success: true, message: result.message }

  // 4. Invalidate
  // 5. Navigate
}

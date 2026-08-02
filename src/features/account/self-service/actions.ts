'use server'

import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { PasswordChangeInputSchema } from './schemas'
import { changePassword } from './service'

export type PasswordChangeActionState = FormState<typeof PasswordChangeInputSchema>
export const initialPasswordChangeState: PasswordChangeActionState = {}

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

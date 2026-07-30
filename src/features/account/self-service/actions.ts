'use server'

import { createServerValidate, initialFormState } from '@tanstack/react-form-nextjs'
import { formOpts } from './password-change-form'
import { PasswordChangeInputSchema } from './schemas'
import { changePassword } from './service'

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: PasswordChangeInputSchema,
})

export type PasswordChangeActionState = {
  message?: string
  success?: boolean
} & typeof initialFormState

export async function changePasswordAction(
  _previousState: PasswordChangeActionState,
  formData: FormData,
): Promise<PasswordChangeActionState> {
  try {
    const validatedData = await serverValidate(formData)
    const result = await changePassword({
      currentPassword: validatedData.currentPassword,
      newPassword: validatedData.newPassword,
    })

    return { ...initialFormState, ...result }
  } catch {
    return {
      ...initialFormState,
      success: false,
    }
  }
}

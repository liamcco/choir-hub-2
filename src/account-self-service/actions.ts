'use server'

import { redirect } from 'next/navigation'
import { getAccountSelfService } from '@/account-self-service/runtime'
import { AccountSelfServiceAuthorizationError, AccountSelfServiceValidationError } from '@/account-self-service/service'
import { getCurrentAccessActor } from '@/lib/access-actor'
import { ROUTES } from '@/lib/route-access'

export type PasswordChangeFormState = {
  message?: string
  success?: boolean
  fieldErrors?: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}

export async function changePasswordAction(
  _previousState: PasswordChangeFormState,
  formData: FormData,
): Promise<PasswordChangeFormState> {
  try {
    const service = await getAccountSelfService()
    const result = await service.changePassword(await getCurrentAccessActor(), {
      currentPassword: String(formData.get('currentPassword') ?? ''),
      newPassword: String(formData.get('newPassword') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    })
    return { success: true, message: result.message }
  } catch (error) {
    if (error instanceof AccountSelfServiceAuthorizationError) {
      redirect(ROUTES.login)
    }
    if (error instanceof AccountSelfServiceValidationError) {
      return {
        success: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      }
    }
    throw error
  }
}

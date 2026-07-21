import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { audit } from '@/core/logging'

export type PasswordChangeInput = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export type PasswordChangeResult = {
  message: string
}

export async function changePassword(input: PasswordChangeInput) {
  const result = await auth.api.changePassword({
    headers: await headers(),
    body: input,
  })

  audit.accountAccessChanged({ actorUserId: result.user.id, action: 'password.change', subjectUserId: result.user.id })

  return { message: 'Password changed successfully.' }
}

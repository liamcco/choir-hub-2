import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export type PasswordChangeInput = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export type PasswordChangeResult = {
  message: string
}

export async function changePassword(input: PasswordChangeInput) {
  await auth.api.changePassword({
    headers: await headers(),
    body: input,
  })

  return { message: 'Password changed successfully.' }
}

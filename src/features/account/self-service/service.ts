import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { EmailClient } from '@/core/email/smtp-email'
import { audit } from '@/core/logging'

export type PasswordChangeInput = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export async function changePassword(input: PasswordChangeInput) {
  const result = await auth.api.changePassword({
    headers: await headers(),
    body: input,
  })

  audit.accountAccessChanged({ actorUserId: result.user.id, action: 'password.change', subjectUserId: result.user.id })

  const emailClient = EmailClient()
  await emailClient.send({
    to: result.user.email,
    subject: 'You just reset your Password!',
    text: `If you did not request this, please contact support.`,
  })

  return { message: 'Password changed successfully.' }
}

import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { EmailClient } from '@/core/email/smtp-email'
import { audit, logger } from '@/core/logging'
import { getErrorName } from '@/shared/errors'

export type PasswordChangeInput = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export type PasswordChangeResult = { success: true; message: string } | { success: false; message: string }

export async function changePassword(input: PasswordChangeInput): Promise<PasswordChangeResult> {
  let result: Awaited<ReturnType<typeof auth.api.changePassword>>

  try {
    result = await auth.api.changePassword({
      headers: await headers(),
      body: input,
    })
  } catch (error) {
    logger.warn('auth.password-change.failed', { errorName: getErrorName(error) })
    return {
      success: false,
      message: 'Unable to change your password. Check your current password and try again.',
    }
  }

  audit.accountAccessChanged({ actorUserId: result.user.id, action: 'password.change', subjectUserId: result.user.id })

  const emailClient = EmailClient()
  await emailClient.send({
    to: result.user.email,
    subject: 'You just reset your Password!',
    text: `If you did not request this, please contact support.`,
  })

  return { success: true, message: 'Password changed successfully.' }
}

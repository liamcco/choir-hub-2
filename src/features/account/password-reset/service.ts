import { authClient } from '@/core/auth/auth-client'
import { logger } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { getErrorCode, getErrorName, getErrorStatus } from '@/shared/errors'

const genericResetError = 'Unable to send a password reset email right now. Please try again.'
const genericPasswordUpdateError = 'Unable to reset your password right now. Please try again.'

export type PasswordResetFailureKind = 'invalid-reset-token' | 'network' | 'unknown'
export type PasswordResetResult = { success: true } | { success: false; kind: PasswordResetFailureKind; error: string }

export async function requestPasswordReset(email: string): Promise<PasswordResetResult> {
  try {
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
    })

    if (result.error) {
      logger.warn('auth.password-reset.request-failed', result.error)
      return { success: false, kind: getFailureKind(result.error), error: genericResetError }
    }
    return { success: true }
  } catch (error) {
    logger.error('auth.password-reset.request-failed', { kind: 'network', errorName: getErrorName(error) })
    return { success: false, kind: 'network', error: genericResetError }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
  try {
    const result = await authClient.resetPassword({ newPassword, token })
    if (result.error) {
      const kind = getFailureKind(result.error)
      const error =
        kind === 'invalid-reset-token' ? 'That reset link is invalid or has expired.' : genericPasswordUpdateError
      logger.warn('auth.password-reset.failed', { kind, errorCode: getErrorCode(result.error) })
      return { success: false, kind, error }
    }
    return { success: true }
  } catch (error) {
    logger.error('auth.password-reset.failed', { kind: 'network', errorName: getErrorName(error) })
    return { success: false, kind: 'network', error: genericPasswordUpdateError }
  }
}

function getFailureKind(error: unknown): PasswordResetFailureKind {
  const status = getErrorStatus(error)
  if (status >= 500) return 'network'

  const code = getErrorCode(error)
  return ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'INVALID_RESET_TOKEN'].includes(code) ? 'invalid-reset-token' : 'unknown'
}

import { authClient } from '@/core/auth/auth-client'
import { logger } from '@/core/logging'
import { getPostLoginPath, ROUTES } from '@/core/navigation/site'
import { getErrorCode, getErrorName } from '@/shared/errors'

export type EmailPasswordSignInInput = {
  email: string
  password: string
  rememberMe: boolean
  returnTo?: string
}

export type LoginFailureKind = 'invalid-credentials' | 'network' | 'unknown'
export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; kind: LoginFailureKind; error: string }

export async function signInWithEmailPassword(input: EmailPasswordSignInInput): Promise<LoginResult> {
  try {
    const result = await authClient.signIn.email({
      email: input.email,
      password: input.password,
      callbackURL: ROUTES.home,
      rememberMe: input.rememberMe,
    })

    if (result.error) {
      logger.warn('auth.login.failed', { kind: 'invalid-credentials', errorCode: getErrorCode(result.error) })
      return {
        success: false,
        kind: 'invalid-credentials',
        error: 'Unable to sign in. Check your email and password and try again.',
      }
    }

    return { success: true, redirectTo: getPostLoginPath(result.data.user?.role, input.returnTo) }
  } catch (error) {
    logger.error('auth.login.unexpected-failure', { kind: 'network', errorName: getErrorName(error) })
    return {
      success: false,
      kind: 'network',
      error: 'Unable to sign in right now. Check your connection and try again.',
    }
  }
}

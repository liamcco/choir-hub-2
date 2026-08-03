import { authClient } from '@/core/auth/auth-client'
import { getPostLoginPath, ROUTES } from '@/core/navigation/site'

export type EmailPasswordSignInInput = {
  email: string
  password: string
  rememberMe: boolean
  returnTo?: string
}

export type PasskeySignInInput = {
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
      return {
        success: false,
        kind: 'invalid-credentials',
        error: 'Unable to sign in. Check your email and password and try again.',
      }
    }

    return { success: true, redirectTo: getPostLoginPath(result.data.user?.role, input.returnTo) }
  } catch {
    return {
      success: false,
      kind: 'network',
      error: 'Unable to sign in right now. Check your connection and try again.',
    }
  }
}

export async function signInWithPasskey(input: PasskeySignInInput): Promise<LoginResult> {
  try {
    const result = await authClient.signIn.passkey()

    if (result.error) {
      return {
        success: false,
        kind: 'invalid-credentials',
        error: 'Unable to sign in with your passkey. Try again or use your email and password.',
      }
    }

    const role = (result.data.user as { role?: string }).role
    return { success: true, redirectTo: getPostLoginPath(role, input.returnTo) }
  } catch {
    return {
      success: false,
      kind: 'network',
      error: 'Unable to sign in with a passkey right now. Check your connection and try again.',
    }
  }
}

import { authClient } from '@/core/auth/auth-client'
import { ROUTES } from '@/core/navigation/site'

export type EmailPasswordSignInInput = {
  email: string
  password: string
}

export type LoginResult = { success: true; redirectTo: string } | { success: false; error: string }

export async function signInWithEmailPassword(input: EmailPasswordSignInInput): Promise<LoginResult> {
  const result = await authClient.signIn.email({
    email: input.email,
    password: input.password,
    callbackURL: ROUTES.home,
    rememberMe: true,
  })

  if (result.error) {
    return { success: false, error: result.error.message || 'Sign-in failed.' }
  }

  return { success: true, redirectTo: getPostLoginPath(result.data.user) }
}

function getPostLoginPath(user?: { id: string; role?: string | null }): string {
  if (user?.role === 'admin') return ROUTES.adminRoot
  return ROUTES.home
}

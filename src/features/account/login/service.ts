import { getPostLoginPath } from '@/core/navigation/app-routes'

export type EmailPasswordSignInInput = {
  email: string
  password: string
}

export type LoginAuthClient = {
  signIn: {
    email(input: { email: string; password: string; callbackURL: string; rememberMe: boolean }): Promise<{
      error?: { message?: string | null } | null
    }>
  }
}

export type LoginResult = { success: true; redirectTo: string } | { success: false; error: string }

export async function signInWithEmailPassword(
  authClient: LoginAuthClient,
  input: EmailPasswordSignInInput,
): Promise<LoginResult> {
  const defaultRedirectTo = getPostLoginPath()
  const result = await authClient.signIn.email({
    email: input.email,
    password: input.password,
    callbackURL: defaultRedirectTo,
    rememberMe: true,
  })

  if (result.error) {
    return { success: false, error: result.error.message || 'Sign-in failed.' }
  }

  return { success: true, redirectTo: getPostLoginPath() }
}

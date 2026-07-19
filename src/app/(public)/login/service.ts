import type { AccessActor } from '@/lib/access-actor'
import { getPostLoginPath } from '@/lib/route-access'

export type EmailPasswordSignInInput = {
  email: string
  password: string
}

export type LoginAuthClient = {
  signIn: {
    email(input: { email: string; password: string; callbackURL: string; rememberMe: boolean }): Promise<{
      data?: { user?: { id?: unknown; role?: AccessActor['role'] } | null } | null
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

  return { success: true, redirectTo: getPostLoginPath(toSignedInActor(result.data?.user)) }
}

function toSignedInActor(user: { id?: unknown; role?: AccessActor['role'] } | null | undefined): AccessActor | null {
  return typeof user?.id === 'string' ? { id: user.id, role: user.role } : null
}

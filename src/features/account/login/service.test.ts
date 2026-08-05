import { beforeEach, describe, expect, mock, test } from 'bun:test'

const signInEmail = mock(async () => ({
  data: { user: { id: 'user-member', role: 'user' } },
  error: null as null | { message: string },
}))
const signInUsername = mock(async () => ({
  data: { user: { id: 'user-member', role: 'user' } },
  error: null as null | { message: string },
}))
mock.module('@/core/auth/auth-client', () => ({
  authClient: { signIn: { email: signInEmail, username: signInUsername } },
}))

import { signInWithEmailPassword, signInWithIdentifier } from './service'

beforeEach(() => {
  signInEmail.mockReset()
  signInUsername.mockReset()
})

describe('login service', () => {
  test('signs in with a username when the identifier is not an email', async () => {
    signInUsername.mockResolvedValue({ data: { user: { id: 'user-member', role: 'user' } }, error: null })

    await expect(
      signInWithIdentifier({
        identifier: 'member_name',
        password: 'correct horse battery staple',
        rememberMe: true,
      }),
    ).resolves.toEqual({ success: true, redirectTo: '/' })

    expect(signInUsername).toHaveBeenCalledWith({
      username: 'member_name',
      password: 'correct horse battery staple',
      callbackURL: '/',
      rememberMe: true,
    })
  })

  test('signs in member accounts with the organizational post-login destination', async () => {
    signInEmail.mockResolvedValue({ data: { user: { id: 'user-member', role: 'user' } }, error: null })
    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'correct horse battery staple',
        rememberMe: true,
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/',
    })

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'correct horse battery staple',
      callbackURL: '/',
      rememberMe: true,
    })
  })

  test('uses the organizational post-login destination for admin accounts too', async () => {
    signInEmail.mockResolvedValue({ data: { user: { id: 'user-admin', role: 'admin' } }, error: null })
    await expect(
      signInWithEmailPassword({
        email: 'admin@example.com',
        password: 'correct horse battery staple',
        rememberMe: true,
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/admin',
    })

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'correct horse battery staple',
      callbackURL: '/',
      rememberMe: true,
    })
  })

  test('uses a safe requested destination after sign-in', async () => {
    signInEmail.mockResolvedValue({ data: { user: { id: 'user-member', role: 'user' } }, error: null })

    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'correct horse battery staple',
        rememberMe: false,
        returnTo: '/account?tab=password',
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/account?tab=password',
    })
  })

  test('rejects external requested destinations', async () => {
    signInEmail.mockResolvedValue({ data: { user: { id: 'user-member', role: 'user' } }, error: null })

    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'correct horse battery staple',
        rememberMe: false,
        returnTo: 'https://example.com/steal-session',
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/',
    })
  })

  test('returns clear sign-in errors from the auth client', async () => {
    signInEmail.mockResolvedValue({
      data: { user: { id: 'user-member', role: 'user' } },
      error: { message: 'Invalid email or password.' },
    })
    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'wrong password',
        rememberMe: false,
      }),
    ).resolves.toEqual({
      success: false,
      kind: 'invalid-credentials',
      error: 'Unable to sign in. Check your email and password and try again.',
    })
  })

  test('normalizes unexpected auth failures', async () => {
    signInEmail.mockRejectedValue(new Error('database details should not reach the client'))

    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'correct horse battery staple',
        rememberMe: false,
      }),
    ).resolves.toEqual({
      success: false,
      kind: 'network',
      error: 'Unable to sign in right now. Check your connection and try again.',
    })
  })
})

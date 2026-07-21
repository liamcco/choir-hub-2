import { beforeEach, describe, expect, mock, test } from 'bun:test'
const signInEmail = mock(async () => ({
  data: { user: { id: 'user-member', role: 'user' } },
  error: null as null | { message: string },
}))
mock.module('@/core/auth/auth-client', () => ({ authClient: { signIn: { email: signInEmail } } }))
import { signInWithEmailPassword } from './service'

beforeEach(() => signInEmail.mockReset())

describe('login service', () => {
  test('signs in member accounts with the organizational post-login destination', async () => {
    signInEmail.mockResolvedValue({ data: { user: { id: 'user-member', role: 'user' } }, error: null })
    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'correct horse battery staple',
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

  test('returns clear sign-in errors from the auth client', async () => {
    signInEmail.mockResolvedValue({
      data: { user: { id: 'user-member', role: 'user' } },
      error: { message: 'Invalid email or password.' },
    })
    await expect(
      signInWithEmailPassword({
        email: 'member@example.com',
        password: 'wrong password',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Invalid email or password.',
    })
  })
})

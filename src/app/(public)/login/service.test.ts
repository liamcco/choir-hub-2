import { describe, expect, mock, test } from 'bun:test'
import { type LoginAuthClient, signInWithEmailPassword } from './service'

describe('login service', () => {
  test('signs in member accounts with the organizational post-login destination', async () => {
    const signInEmail = mock(async () => ({ data: { user: { id: 'user-member', role: 'user' } }, error: null }))
    const authClient = loginAuthClient(signInEmail)

    await expect(
      signInWithEmailPassword(authClient, {
        email: 'member@example.com',
        password: 'correct horse battery staple',
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/organization',
    })

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'correct horse battery staple',
      callbackURL: '/organization',
      rememberMe: true,
    })
  })

  test('uses the signed-in admin actor for the post-login destination', async () => {
    const signInEmail = mock(async () => ({ data: { user: { id: 'user-admin', role: 'admin' } }, error: null }))
    const authClient = loginAuthClient(signInEmail)

    await expect(
      signInWithEmailPassword(authClient, {
        email: 'admin@example.com',
        password: 'correct horse battery staple',
      }),
    ).resolves.toEqual({
      success: true,
      redirectTo: '/admin/members',
    })

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'correct horse battery staple',
      callbackURL: '/organization',
      rememberMe: true,
    })
  })

  test('returns clear sign-in errors from the auth client', async () => {
    const authClient = loginAuthClient(mock(async () => ({ error: { message: 'Invalid email or password.' } })))

    await expect(
      signInWithEmailPassword(authClient, {
        email: 'member@example.com',
        password: 'wrong password',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Invalid email or password.',
    })
  })
})

function loginAuthClient(signInEmail: LoginAuthClient['signIn']['email']): LoginAuthClient {
  return {
    signIn: {
      email: signInEmail,
    },
  }
}

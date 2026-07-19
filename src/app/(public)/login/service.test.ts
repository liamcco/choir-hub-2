import { describe, expect, mock, test } from 'bun:test'
import { type LoginAuthClient, signInWithEmailPassword } from './service'

describe('login service', () => {
  test('signs in with email and password and returns the post-login destination', async () => {
    const signInEmail = mock(async () => ({ error: null }))
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

import { describe, expect, test } from 'bun:test'
import { authOptions } from '@/lib/auth-options'

describe('auth options', () => {
  test('keeps public email/password self-registration unavailable', () => {
    expect(authOptions.emailAndPassword.disableSignUp).toBe(true)
  })

  test('keeps auth email sendouts as console callbacks', () => {
    expect(authOptions.emailAndPassword.sendResetPassword).toBeFunction()
    expect(authOptions.emailVerification.sendVerificationEmail).toBeFunction()
  })
})

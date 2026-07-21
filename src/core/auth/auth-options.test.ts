import { describe, expect, test } from 'bun:test'
import { authClient } from '@/core/auth/auth-client'
import { authOptions, createAuth } from '@/core/auth/auth-options'

describe('auth options', () => {
  test('keeps public email/password self-registration unavailable', () => {
    expect(authOptions.emailAndPassword.disableSignUp).toBe(true)
  })

  test('configures auth email callbacks', () => {
    expect(authOptions.emailAndPassword.sendResetPassword).toBeFunction()
    expect(authOptions.emailVerification.sendVerificationEmail).toBeFunction()
  })

  test('uses the shared access-control definitions in the server admin plugin', async () => {
    const configuredAuth = createAuth()

    await expect(
      configuredAuth.api.userHasPermission({ body: { role: 'admin', permissions: { group: ['update'] } } }),
    ).resolves.toEqual({ error: null, success: true })
    await expect(
      configuredAuth.api.userHasPermission({ body: { role: 'user', permissions: { group: ['update'] } } }),
    ).resolves.toEqual({ error: null, success: false })
  })

  test('uses the shared access-control definitions in the client admin plugin', () => {
    expect(authClient.admin.checkRolePermission({ role: 'admin', permissions: { group: ['update'] } })).toBe(true)
    expect(authClient.admin.checkRolePermission({ role: 'user', permissions: { group: ['update'] } })).toBe(false)
  })
})

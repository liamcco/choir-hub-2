import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requestPasswordResetEndpoint = mock(async () => ({ error: null as null | { code?: string; status?: number } }))
const resetPasswordEndpoint = mock(async () => ({ error: null as null | { code?: string; status?: number } }))

mock.module('@/core/auth/auth-client', () => ({
  authClient: {
    requestPasswordReset: requestPasswordResetEndpoint,
    resetPassword: resetPasswordEndpoint,
  },
}))

import { requestPasswordReset, resetPassword } from './service'

beforeEach(() => {
  requestPasswordResetEndpoint.mockReset()
  resetPasswordEndpoint.mockReset()
})

describe('password reset service', () => {
  test('classifies invalid reset tokens separately from transient failures', async () => {
    resetPasswordEndpoint.mockResolvedValue({ error: { code: 'INVALID_TOKEN', status: 400 } })

    await expect(resetPassword('expired-token', 'correct horse battery staple')).resolves.toEqual({
      success: false,
      kind: 'invalid-reset-token',
      error: 'That reset link is invalid or has expired.',
    })

    resetPasswordEndpoint.mockResolvedValue({ error: { code: 'INTERNAL_ERROR', status: 500 } })
    await expect(resetPassword('valid-token', 'correct horse battery staple')).resolves.toEqual({
      success: false,
      kind: 'network',
      error: 'Unable to reset your password right now. Please try again.',
    })
  })

  test('normalizes request exceptions without exposing details', async () => {
    requestPasswordResetEndpoint.mockRejectedValue(new Error('SMTP details should not reach the client'))

    await expect(requestPasswordReset('member@example.com')).resolves.toEqual({
      success: false,
      kind: 'network',
      error: 'Unable to send a password reset email right now. Please try again.',
    })
  })
})

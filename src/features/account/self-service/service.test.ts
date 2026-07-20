import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requestHeaders = new Headers({ cookie: 'session=abc' })
const headers = mock(async () => requestHeaders)
const authChangePassword = mock(async () => ({ user: { id: 'user-1' }, token: null }))

mock.module('next/headers', () => ({
  headers,
}))

mock.module('@/core/auth/auth', () => ({
  auth: {
    api: {
      changePassword: authChangePassword,
    },
  },
}))

const { changePassword } = await import('@/features/account/self-service/service')

beforeEach(() => {
  headers.mockClear()
  authChangePassword.mockClear()
})

describe('account self-service password changes', () => {
  test('changes password through Better Auth with the current request headers', async () => {
    await expect(
      changePassword({
        currentPassword: 'old-password',
        newPassword: 'new-password',
        revokeOtherSessions: true,
      }),
    ).resolves.toEqual({ message: 'Password changed successfully.' })

    expect(headers).toHaveBeenCalledTimes(1)
    expect(authChangePassword).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        revokeOtherSessions: true,
      },
    })
  })
})

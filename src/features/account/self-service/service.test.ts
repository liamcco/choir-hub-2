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
const { changePasswordAction, initialPasswordChangeState } = await import('@/features/account/self-service/actions')

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
    ).resolves.toEqual({ success: true, message: 'Password changed successfully.' })

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

  test('returns a safe error when Better Auth rejects the password change', async () => {
    authChangePassword.mockRejectedValueOnce(new Error('Invalid password'))

    await expect(
      changePassword({
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).resolves.toEqual({
      success: false,
      message: 'Unable to change your password. Check your current password and try again.',
    })
  })

  test('returns the password-change error through the server action state', async () => {
    authChangePassword.mockRejectedValueOnce(new Error('Invalid password'))
    const formData = new FormData()
    formData.set('currentPassword', 'wrong-password')
    formData.set('newPassword', 'new-password')
    formData.set('confirmPassword', 'new-password')

    await expect(changePasswordAction(initialPasswordChangeState, formData)).resolves.toMatchObject({
      success: false,
      message: 'Unable to change your password. Check your current password and try again.',
    })
  })
})

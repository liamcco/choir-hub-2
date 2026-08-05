import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requestHeaders = new Headers({ cookie: 'session=abc' })
const headers = mock(async () => requestHeaders)
const authChangePassword = mock(async () => ({ user: { id: 'user-1' }, token: null }))
const authGetSession = mock(async () => ({ user: { id: 'user-1', email: 'member@example.com' } }))
const authUpdateUser = mock(async () => ({ status: true }))

mock.module('next/headers', () => ({
  headers,
}))

mock.module('@/core/auth/auth', () => ({
  auth: {
    api: {
      changePassword: authChangePassword,
      getSession: authGetSession,
      updateUser: authUpdateUser,
    },
  },
}))

const { changePassword } = await import('@/features/account/self-service/service')
const { changePasswordAction } = await import('@/features/account/self-service/actions')

beforeEach(() => {
  headers.mockClear()
  authChangePassword.mockClear()
  authGetSession.mockClear()
  authUpdateUser.mockClear()
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

    await expect(changePasswordAction({}, formData)).resolves.toMatchObject({
      success: false,
      message: 'Unable to change your password. Check your current password and try again.',
    })
  })
})

describe('account self-service username changes', () => {
  test('updates the username through Better Auth using the current session', async () => {
    const { changeUsername } = await import('@/features/account/self-service/service')

    await expect(changeUsername({ username: 'new_member' })).resolves.toEqual({
      success: true,
      message: 'Username updated successfully.',
    })

    expect(authGetSession).toHaveBeenCalledWith({ headers: requestHeaders })
    expect(authUpdateUser).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { username: 'new_member', displayUsername: 'new_member' },
    })
  })

  test('returns a safe error when the username is rejected', async () => {
    const { changeUsername } = await import('@/features/account/self-service/service')
    authUpdateUser.mockRejectedValueOnce(new Error('Username is already taken'))

    await expect(changeUsername({ username: 'taken_name' })).resolves.toEqual({
      success: false,
      message: 'Unable to update your username. It may already be in use or be invalid.',
    })
  })
})

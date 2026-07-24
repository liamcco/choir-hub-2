import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { APIError } from 'better-auth'

const requireAdmin = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermission = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const createUser = mock(async () => ({ id: 'user-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})
const revalidatePath = mock(() => {})

mock.module('next/cache', () => ({ revalidatePath }))
mock.module('@/core/auth/permissions.server', () => ({ requireAdmin, requireCurrentUserPermission }))
mock.module('@/core/logging', () => ({ audit: { adminActionCompleted, accountAccessChanged } }))
mock.module('@/features/organization/management/members/service', () => ({
  userService: { createUser },
}))

const { createUserAction } = await import('./actions')

beforeEach(() => {
  requireAdmin.mockClear()
  requireCurrentUserPermission.mockClear()
  createUser.mockClear()
  adminActionCompleted.mockClear()
  accountAccessChanged.mockClear()
  revalidatePath.mockClear()
})

describe('create User action', () => {
  test('returns an email field error when Better Auth rejects a duplicate email', async () => {
    createUser.mockRejectedValueOnce(
      new APIError('BAD_REQUEST', {
        message: 'User already exists. Use another email.',
        code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
      }),
    )

    await expect(createUserAction({}, createUserFormData())).resolves.toEqual({
      success: false,
      fieldErrors: { email: 'Email already taken' },
    })
  })
})

function createUserFormData() {
  const formData = new FormData()
  formData.set('name', 'Ada Lovelace')
  formData.set('email', 'ada@example.com')
  formData.set('password', 'correct horse battery staple')
  formData.set('status', 'ACTIVE')
  return formData
}

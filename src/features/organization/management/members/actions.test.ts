import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { UserOnboardingBatchResult } from './onboarding/service'

const requireAdmin = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermission = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const onboardBatch = mock(async (): Promise<UserOnboardingBatchResult> => ({ validationErrors: [], outcomes: [] }))
const updateMemberStatus = mock(async () => undefined)
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})
const loggerError = mock(() => {})
const revalidatePath = mock(() => {})

mock.module('next/cache', () => ({ revalidatePath }))
mock.module('@/core/auth/permissions.server', () => ({ requireAdmin, requireCurrentUserPermission }))
mock.module('@/core/logging', () => ({
  audit: { adminActionCompleted, accountAccessChanged },
  logger: { error: loggerError },
}))
mock.module('@/features/organization/core/users', () => ({ users: { updateMemberStatus } }))
mock.module('@/features/organization/management/members/onboarding', () => ({
  userOnboarding: { onboardBatch },
}))

const { createUserAction } = await import('./actions')

beforeEach(() => {
  requireAdmin.mockClear()
  requireCurrentUserPermission.mockClear()
  onboardBatch.mockReset()
  onboardBatch.mockResolvedValue({ validationErrors: [], outcomes: [] })
  updateMemberStatus.mockClear()
  adminActionCompleted.mockClear()
  accountAccessChanged.mockClear()
  loggerError.mockClear()
  revalidatePath.mockClear()
})

describe('create User action', () => {
  test('returns an email field error when onboarding rejects a duplicate email', async () => {
    onboardBatch.mockResolvedValueOnce({
      validationErrors: [{ field: 'email', message: 'Email is already registered.' }],
      outcomes: [],
    })

    await expect(createUserAction({}, createUserFormData())).resolves.toEqual({
      success: false,
      message: 'Email is already registered.',
      fieldErrors: { email: 'Email is already registered.' },
    })
  })
})

function createUserFormData() {
  const formData = new FormData()
  formData.set('name', 'Ada Lovelace')
  formData.set('email', 'ada@example.com')
  formData.set('status', 'ACTIVE')
  return formData
}

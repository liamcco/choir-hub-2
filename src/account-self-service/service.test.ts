import { describe, expect, test } from 'bun:test'
import {
  AccountSelfServiceAuthorizationError,
  createAccountSelfService,
  type PasswordChangeGateway,
} from '@/account-self-service/service'

describe('account self-service', () => {
  test('requires an authenticated account to change password', async () => {
    const service = createAccountSelfService({
      passwordGateway: new InMemoryPasswordChangeGateway(),
    })

    await expect(
      service.changePassword(null, {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        confirmPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(AccountSelfServiceAuthorizationError)
  })

  test('validates password change fields with clear errors', async () => {
    const service = createAccountSelfService({
      passwordGateway: new InMemoryPasswordChangeGateway(),
    })

    await expect(
      service.changePassword(
        { id: 'user-1', role: 'user' },
        {
          currentPassword: '',
          newPassword: 'short',
          confirmPassword: 'different',
        },
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        currentPassword: 'Current password is required.',
        newPassword: 'Password must be at least 8 characters.',
        confirmPassword: 'Passwords do not match.',
      },
    })
  })

  test('changes password for authenticated non-admin accounts', async () => {
    const passwordGateway = new InMemoryPasswordChangeGateway()
    const service = createAccountSelfService({ passwordGateway })

    await expect(
      service.changePassword(
        { id: 'user-1', role: 'user' },
        {
          currentPassword: 'old-password',
          newPassword: 'new-password',
          confirmPassword: 'new-password',
        },
      ),
    ).resolves.toEqual({ message: 'Password updated.' })

    expect(passwordGateway.changes).toEqual([
      {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        revokeOtherSessions: true,
      },
    ])
  })

  test('maps incorrect current password to a form-level validation error', async () => {
    const service = createAccountSelfService({
      passwordGateway: new InMemoryPasswordChangeGateway('Invalid password'),
    })

    await expect(
      service.changePassword(
        { id: 'user-1', role: 'user' },
        {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
          confirmPassword: 'new-password',
        },
      ),
    ).rejects.toMatchObject({
      message: 'Current password is incorrect.',
      fieldErrors: { currentPassword: 'Current password is incorrect.' },
    })
  })
})

class InMemoryPasswordChangeGateway implements PasswordChangeGateway {
  changes: Parameters<PasswordChangeGateway['changePassword']>[0][] = []

  constructor(private readonly failureMessage?: string) {}

  async changePassword(input: Parameters<PasswordChangeGateway['changePassword']>[0]) {
    if (this.failureMessage) {
      throw new Error(this.failureMessage)
    }
    this.changes.push(input)
  }
}

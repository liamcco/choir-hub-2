import type { AccessActor } from '@/lib/access-actor'

export type PasswordChangeInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type PasswordChangeResult = {
  message: string
}

export type PasswordChangeGateway = {
  changePassword(input: { currentPassword: string; newPassword: string; revokeOtherSessions: boolean }): Promise<void>
}

export type AccountSelfService = {
  changePassword(actor: AccessActor | null | undefined, input: PasswordChangeInput): Promise<PasswordChangeResult>
}

export type AccountSelfServiceFieldErrors = Partial<
  Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>
>

export class AccountSelfServiceAuthorizationError extends Error {
  constructor() {
    super('Sign in to manage your account.')
  }
}

export class AccountSelfServiceValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: AccountSelfServiceFieldErrors = {},
  ) {
    super(message)
  }
}

export const passwordChangePolicy = {
  minPasswordLength: 8,
  minPasswordLengthMessage: 'Password must be at least 8 characters.',
  minPasswordLengthHint: 'Use at least 8 characters.',
}

export function createAccountSelfService({
  passwordGateway,
}: {
  passwordGateway: PasswordChangeGateway
}): AccountSelfService {
  return {
    async changePassword(actor, input) {
      if (!actor) {
        throw new AccountSelfServiceAuthorizationError()
      }

      const validationErrors = validatePasswordChange(input)
      if (Object.keys(validationErrors).length > 0) {
        throw new AccountSelfServiceValidationError('Fix the password fields and try again.', validationErrors)
      }

      try {
        await passwordGateway.changePassword({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: true,
        })
      } catch (error) {
        throw mapPasswordGatewayError(error)
      }

      return { message: 'Password updated.' }
    },
  }
}

function validatePasswordChange(input: PasswordChangeInput): AccountSelfServiceFieldErrors {
  const fieldErrors: AccountSelfServiceFieldErrors = {}

  if (!input.currentPassword) {
    fieldErrors.currentPassword = 'Current password is required.'
  }
  if (input.newPassword.length < passwordChangePolicy.minPasswordLength) {
    fieldErrors.newPassword = passwordChangePolicy.minPasswordLengthMessage
  }
  if (input.newPassword !== input.confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.'
  }

  return fieldErrors
}

function mapPasswordGatewayError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.toLowerCase().includes('invalid password')) {
    return new AccountSelfServiceValidationError('Current password is incorrect.', {
      currentPassword: 'Current password is incorrect.',
    })
  }
  return error
}

import { z } from 'zod'

export const passwordPolicy = {
  minPasswordLength: 8,
  minPasswordLengthMessage: 'Password must be at least 8 characters.',
  minPasswordLengthHint: 'Use at least 8 characters.',
} as const

export function passwordField(label: string) {
  return z.string().min(passwordPolicy.minPasswordLength, {
    message: `${label} must be at least ${passwordPolicy.minPasswordLength} characters.`,
  })
}

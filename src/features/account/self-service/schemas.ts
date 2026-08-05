import { z } from 'zod'
import { passwordField } from '@/shared/forms/schemas'

export const usernameField = z
  .string({ error: 'Username is required.' })
  .trim()
  .min(3, { message: 'Username must be at least 3 characters.' })
  .max(30, { message: 'Username must be at most 30 characters.' })
  .regex(/^[a-zA-Z0-9_.]+$/, { message: 'Username may only contain letters, numbers, underscores, and periods.' })

export const UsernameChangeInputSchema = z.object({
  username: usernameField,
})

export const PasswordChangeInputSchema = z
  .object({
    currentPassword: passwordField('Current password'),
    newPassword: passwordField('New password'),
    confirmPassword: passwordField('Confirm password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match.',
    path: ['confirmPassword'],
  })

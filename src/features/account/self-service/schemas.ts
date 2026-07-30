import { z } from 'zod'
import { passwordField } from '@/features/account/password-policy'

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

import { z } from 'zod'

export const passwordChangePolicy = {
  minPasswordLength: 8,
  minPasswordLengthMessage: 'Password must be at least 8 characters.',
  minPasswordLengthHint: 'Use at least 8 characters.',
}

export const PasswordChangeInputSchema = z
  .object({
    currentPassword: z.string().min(8, { message: 'Current password must be at least 8 characters.' }),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string().min(8, { message: 'Confirm password must be at least 8 characters.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match.',
    path: ['confirmPassword'],
  })

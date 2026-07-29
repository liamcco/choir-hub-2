import { z } from 'zod'
import { passwordField } from '@/features/account/password-policy'

export const passwordResetRequestSchema = z.object({
  email: z.email().trim(),
})

export const passwordResetSchema = z
  .object({
    password: passwordField('Password'),
    confirmPassword: passwordField('Confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>

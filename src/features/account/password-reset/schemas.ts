import { z } from 'zod'
import { passwordField } from '@/shared/forms/schemas'

export const passwordResetRequestSchema = z.object({
  email: z.email(),
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

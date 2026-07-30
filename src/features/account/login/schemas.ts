import z from 'zod'
import { normalizedEmailField, passwordField } from '@/shared/forms/schemas'

export const loginSchema = z.object({
  email: normalizedEmailField('Email'),
  password: passwordField('Password'),
  rememberMe: z.boolean(),
})

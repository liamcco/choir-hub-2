import { z } from 'zod'
import { personSchema, adminPersonUserSchema } from './people'

export const provisionPersonInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Email must be valid'),
  password: z
    .string()
    .trim()
    .max(128, 'Password is too long')
    .transform((password) => password || undefined)
    .refine((password) => !password || password.length >= 8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']).default('user'),
})

export const provisionPersonItemSchema = provisionPersonInputSchema.extend({
  password: provisionPersonInputSchema.shape.password.optional(),
})

export const provisionPeopleSchema = z.object({
  people: z.array(provisionPersonItemSchema).min(1, 'At least one person is required'),
})

export const provisionPersonSuccessSchema = z.object({
  person: personSchema,
  user: adminPersonUserSchema,
})

export const provisionPersonSkippedSchema = z.object({
  name: z.string(),
  email: z.email(),
  message: z.string(),
})

export const provisionPersonFailedSchema = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
})

export const provisionPeopleResponseSchema = z.object({
  succeeded: z.array(provisionPersonSuccessSchema),
  skipped: z.array(provisionPersonSkippedSchema),
  failed: z.array(provisionPersonFailedSchema),
})

import { z } from 'zod'

export const personSchema = z.object({
  id: z.string(),
})

export const peopleResponseSchema = z.object({
  people: z.array(personSchema),
})

export const personIdParamsSchema = z.object({
  id: z.string().min(1),
})

export const createPersonSchema = z.object({
  id: z.string().min(1),
})

export const adminPersonUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  role: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const adminPersonSchema = personSchema.extend({
  user: adminPersonUserSchema.nullable(),
})

export const adminPeopleResponseSchema = z.object({
  people: z.array(adminPersonSchema),
})

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

import { z } from 'zod'
import { userSchema } from './user.base'

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Email must be valid'),
  password: z
    .string()
    .trim()
    .max(128, 'Password is too long')
    .refine((password) => !password || password.length >= 8, 'Password must be at least 8 characters')
    .optional(),
  role: z.enum(['user', 'admin']).default('user'),
})

export const createUsersRequestSchema = z.object({
  users: z.array(createUserSchema).min(1, 'At least one user is required'),
})

export const createUserSkippedResponseSchema = z.object({
  name: z.string(),
  email: z.email(),
  message: z.string(),
})

export const createUserFailedResponseSchema = z.object({
  name: z.string(),
  email: z.email(),
  message: z.string(),
})

export const createUsersResponseSchema = z.object({
  succeeded: z.array(userSchema),
  skipped: z.array(createUserSkippedResponseSchema),
  failed: z.array(createUserFailedResponseSchema),
})

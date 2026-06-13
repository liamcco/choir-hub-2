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

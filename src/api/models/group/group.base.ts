import { z } from 'zod'

export const groupKindSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const groupSchema = z.object({
  id: z.string(),
  kindId: z.string(),
  kindName: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isContainer: z.boolean(),
  parentGroupId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const groupMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  addedAt: z.date().nullable(),
  isDirect: z.boolean(),
})

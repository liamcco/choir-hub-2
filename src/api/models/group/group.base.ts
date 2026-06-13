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
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  isContainer: z.boolean(),
  parentGroupId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  kind: groupKindSchema.optional(),
})

export const groupMemberSchema = z.object({
  userId: z.string(),
  addedAt: z.date(),
  isDirect: z.boolean(),
})

export const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currentHolderPersonId: z.string().nullable(),
  heldSince: z.date().nullable(),
  groups: z.array(
    z.object({
      groupId: z.string(),
      createdAt: z.date(),
      group: groupSchema.optional(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
})

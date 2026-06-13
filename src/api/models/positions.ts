import { z } from 'zod'
import { groupSchema } from './groups'

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

export const positionsResponseSchema = z.object({
  positions: z.array(positionSchema),
})

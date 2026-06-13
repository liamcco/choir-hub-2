import { z } from 'zod'

export const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currentHolderUserId: z.string().nullable(),
  heldSince: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

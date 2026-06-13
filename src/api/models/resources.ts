import { z } from 'zod'

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const resourcesResponseSchema = z.object({
  resources: z.array(resourceSchema),
})

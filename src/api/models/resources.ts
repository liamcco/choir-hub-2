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

export const createResourceInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined),
})

export const createResourceItemSchema = createResourceInputSchema.extend({
  description: createResourceInputSchema.shape.description.optional(),
})

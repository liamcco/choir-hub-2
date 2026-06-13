import { z } from 'zod'

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

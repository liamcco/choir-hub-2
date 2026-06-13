import z from 'zod'
import { createResourceRequestSchema } from './resource.mutate'

export const createResourceFormSchema = createResourceRequestSchema.extend({
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined),
})

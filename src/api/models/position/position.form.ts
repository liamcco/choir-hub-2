import z from 'zod'
import { createPositionRequestSchema, updatePositionRequestSchema, assignPositionHolderRequestSchema } from '../group'

export const createPositionFormSchema = createPositionRequestSchema.extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: z
    .string()
    .trim()
    .transform((description) => description || null)
    .nullable()
    .optional(),
})

export const assignPositionHolderFormSchema = assignPositionHolderRequestSchema.extend({})

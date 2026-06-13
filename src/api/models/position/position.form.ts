import { assignPositionHolderRequestSchema, createPositionRequestSchema, updatePositionRequestSchema } from '../group'

export const createPositionFormSchema = createPositionRequestSchema.extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: updatePositionRequestSchema.shape.description.transform((description) => description || null),
})

export const assignPositionHolderFormSchema = assignPositionHolderRequestSchema.extend({})

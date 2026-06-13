import { createPositionRequestSchema, updatePositionRequestSchema } from './position.mutate'

export const createPositionFormSchema = createPositionRequestSchema.extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: updatePositionRequestSchema.shape.description.transform((description) => description || null),
  currentHolderUserId: updatePositionRequestSchema.shape.currentHolderUserId.transform((userId) => userId || null),
})

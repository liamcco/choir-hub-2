import { createPositionRequestSchema, updatePositionRequestSchema } from './position.mutate'
import { z } from 'zod'

export const createPositionFormSchema = createPositionRequestSchema.omit({ groupIds: true }).extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
  groupId: z.string().min(1, 'Group is required'),
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: updatePositionRequestSchema.shape.description.transform((description) => description || null),
  currentHolderUserId: updatePositionRequestSchema.shape.currentHolderUserId.transform((userId) => userId || null),
})

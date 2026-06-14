import { createPositionRequestSchema, updatePositionRequestSchema } from './position.mutate'
import { z } from 'zod'

const additionalGroupIdsFormSchema = z.array(z.string().min(1)).default([])

export const createPositionFormSchema = createPositionRequestSchema.omit({ groupIds: true }).extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
  groupIds: additionalGroupIdsFormSchema,
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: updatePositionRequestSchema.shape.description.transform((description) => description || null),
  currentHolderUserId: updatePositionRequestSchema.shape.currentHolderUserId.transform((userId) => userId || null),
})

import z from 'zod'
import {
  addUserToGroupRequestSchema,
  assignPositionHolderRequestSchema,
  createGroupKindRequestSchema,
  createGroupRequestSchema,
  createPositionRequestSchema,
  updateGroupKindRequestSchema,
  updateGroupRequestSchema,
  updatePositionRequestSchema,
} from './group.mutate'

export const createGroupKindFormSchema = createGroupKindRequestSchema.extend({
  description: createGroupKindRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updateGroupKindFormSchema = updateGroupKindRequestSchema.extend({
  description: updateGroupKindRequestSchema.shape.description.transform((description) => description || null),
})

export const createGroupFormSchema = createGroupRequestSchema.extend({
  description: createGroupRequestSchema.shape.description.transform((description) => description || undefined),
})

export const addUserToGroupFormSchema = addUserToGroupRequestSchema.extend({})

export const createPositionFormSchema = createPositionRequestSchema.extend({
  description: createPositionRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updatePositionFormSchema = updatePositionRequestSchema.extend({
  description: updatePositionRequestSchema.shape.description.transform((description) => description || null),
})

export const assignPositionHolderFormSchema = assignPositionHolderRequestSchema.extend({})

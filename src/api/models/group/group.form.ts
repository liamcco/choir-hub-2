import { createGroupKindRequestSchema, createGroupRequestSchema, updateGroupKindRequestSchema } from './group.mutate'

export const createGroupKindFormSchema = createGroupKindRequestSchema.extend({
  description: createGroupKindRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updateGroupKindFormSchema = updateGroupKindRequestSchema.extend({
  description: updateGroupKindRequestSchema.shape.description.transform((description) => description || null),
})

export const createGroupFormSchema = createGroupRequestSchema.extend({
  description: createGroupRequestSchema.shape.description.transform((description) => description || undefined),
})

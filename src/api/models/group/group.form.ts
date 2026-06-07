import { createGroupKindRequestSchema, createGroupRequestSchema } from './group.mutate'

export const createGroupKindFormSchema = createGroupKindRequestSchema.extend({
  description: createGroupKindRequestSchema.shape.description.transform((description) => description || undefined),
})

export const createGroupFormSchema = createGroupRequestSchema.extend({
  description: createGroupRequestSchema.shape.description.transform((description) => description || undefined),
})

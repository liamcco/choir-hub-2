import z from 'zod'
import {
  assignPositionHolderRequestSchema,
  createGroupKindRequestSchema,
  createGroupRequestSchema,
  createMembershipRequestSchema,
  createPositionRequestSchema,
  updateGroupKindRequestSchema,
  updateGroupRequestSchema,
  updatePositionRequestSchema,
} from './group.mutate'

export const createGroupKindFormSchema = createGroupKindRequestSchema.extend({
  description: createGroupKindRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updateGroupKindFormSchema = updateGroupKindRequestSchema.extend({
  description: z
    .string()
    .trim()
    .transform((description) => description || null)
    .nullable()
    .optional(),
})

export const createGroupFormSchema = createGroupRequestSchema.extend({
  description: createGroupRequestSchema.shape.description.transform((description) => description || undefined),
})

export const updateGroupFormSchema = updateGroupRequestSchema.extend({
  description: z
    .string()
    .trim()
    .transform((description) => description || null),
  parentGroupId: z
    .string()
    .min(1, 'Parent group is required')
    .transform((value) => value || null)
    .nullable(),
})

export const createMembershipFormSchema = createMembershipRequestSchema.extend({})

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

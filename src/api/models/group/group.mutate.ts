import { z } from 'zod'

export const createGroupKindRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
})

export const updateGroupKindRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().nullable().optional(),
})

export const createGroupRequestSchema = z.object({
  kindId: z.string().min(1, 'Group kind is required'),
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  isContainer: z.boolean().default(false),
  parentGroupId: z.string().min(1).nullable().optional(),
})

export const updateGroupRequestSchema = z.object({
  kindId: z.string().min(1, 'Group kind is required').optional(),
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().min(1).nullable().optional(),
  isContainer: z.boolean().optional(),
  parentGroupId: z.string().min(1).nullable().optional(),
})

export const addUserToGroupRequestSchema = z.object({
  userId: z.string().min(1, 'User is required'),
})

export const createPositionRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  groupIds: z.array(z.string().min(1)).optional(),
  currentHolderUserId: z.string().min(1).optional(),
  heldSince: z.coerce.date().optional(),
})

export const updatePositionRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().nullable().optional(),
  groupIds: z.array(z.string().min(1)).min(1, 'At least one group is required').optional(),
  currentHolderUserId: z.string().min(1).nullable().optional(),
  heldSince: z.coerce.date().nullable().optional(),
})

export const assignPositionHolderRequestSchema = z.object({
  currentHolderUserId: z.string().min(1, 'User is required'),
  heldSince: z.coerce.date().optional(),
})

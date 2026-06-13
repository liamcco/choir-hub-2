import { z } from 'zod'

export const createPositionRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  groupIds: z.array(z.string().min(1)).optional(),
  currentHolderUserId: z.string().min(1).nullable().optional(),
  heldSince: z.coerce.date().nullable().optional(),
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

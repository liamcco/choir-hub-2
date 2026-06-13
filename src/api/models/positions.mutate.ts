import { z } from 'zod'

export const createPositionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined)
    .optional(),
  groupIds: z.array(z.string().min(1)).optional(),
  currentHolderPersonId: z.string().min(1).nullable().optional(),
  heldSince: z.coerce.date().nullable().optional(),
})

export const updatePositionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z
    .string()
    .trim()
    .transform((description) => description || null)
    .nullable()
    .optional(),
  groupIds: z.array(z.string().min(1)).min(1, 'At least one group is required').optional(),
  currentHolderPersonId: z.string().min(1).nullable().optional(),
  heldSince: z.coerce.date().nullable().optional(),
})

export const assignPositionHolderSchema = z.object({
  currentHolderPersonId: z.string().min(1, 'Person is required'),
  heldSince: z.coerce.date().optional(),
})

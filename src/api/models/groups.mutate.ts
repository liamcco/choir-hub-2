import { z } from 'zod'

export const createGroupKindSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined)
    .optional(),
})

export const updateGroupKindSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z
    .string()
    .trim()
    .transform((description) => description || null)
    .nullable()
    .optional(),
})

export const createGroupSchema = z.object({
  kindId: z.string().min(1, 'Group kind is required'),
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined)
    .optional(),
  active: z.boolean().default(true),
  isContainer: z.boolean().default(false),
  parentGroupId: z.string().min(1).nullable().optional(),
})

export const updateGroupSchema = z.object({
  kindId: z.string().min(1, 'Group kind is required').optional(),
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z
    .string()
    .trim()
    .transform((description) => description || null)
    .nullable()
    .optional(),
  active: z.boolean().optional(),
  isContainer: z.boolean().optional(),
  parentGroupId: z.string().min(1).nullable().optional(),
})

export const createMembershipSchema = z.object({
  personId: z.string().min(1, 'Person is required'),
})

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

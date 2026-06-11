import { z } from 'zod'

export const groupKindSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const groupSchema = z.object({
  id: z.string(),
  kindId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  isContainer: z.boolean(),
  parentGroupId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  kind: groupKindSchema.optional(),
})

export const personGroupMembershipSchema = z.object({
  id: z.string(),
  personId: z.string(),
  groupId: z.string(),
  addedAt: z.date(),
})

export const effectivePersonMembershipSchema = z.object({
  personId: z.string(),
  directGroupIds: z.array(z.string()),
})

export const positionSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  personGroupMembershipId: z.string().nullable(),
  heldSince: z.date().nullable(),
  updatedAt: z.date(),
})

export const groupKindsResponseSchema = z.object({
  groupKinds: z.array(groupKindSchema),
})

export const groupsResponseSchema = z.object({
  groups: z.array(groupSchema),
})

export const groupMembershipsResponseSchema = z.object({
  memberships: z.array(personGroupMembershipSchema),
})

export const effectiveMembershipsResponseSchema = z.object({
  members: z.array(effectivePersonMembershipSchema),
})

export const positionsResponseSchema = z.object({
  positions: z.array(positionSchema),
})

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
  personGroupMembershipId: z.string().min(1).nullable().optional(),
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
  personGroupMembershipId: z.string().min(1).nullable().optional(),
  heldSince: z.coerce.date().nullable().optional(),
})

export const assignPositionHolderSchema = z.object({
  personGroupMembershipId: z.string().min(1, 'Membership is required'),
  heldSince: z.coerce.date().optional(),
})

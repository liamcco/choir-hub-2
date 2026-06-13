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
  name: z.string(),
  description: z.string().nullable(),
  currentHolderPersonId: z.string().nullable(),
  heldSince: z.date().nullable(),
  groups: z.array(
    z.object({
      groupId: z.string(),
      createdAt: z.date(),
      group: groupSchema.optional(),
    }),
  ),
  createdAt: z.date(),
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

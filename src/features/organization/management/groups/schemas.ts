import z from 'zod'
import { GroupKind } from '@/prisma/generated/client'

export const GroupFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Name is required.'),
  description: z.string().nullable().optional(),
  kind: z.enum(GroupKind),
  parentGroupId: z.string().nullable().optional(),
})

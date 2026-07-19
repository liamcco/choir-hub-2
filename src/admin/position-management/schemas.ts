import z from 'zod'

export const PositionFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Name is required.'),
  description: z.string().nullable().optional(),
  groupIds: z.array(z.string()),
})

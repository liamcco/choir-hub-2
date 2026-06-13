import z from 'zod'

export const membersQuerySchema = z.object({
  onlyDirectMembers: z.coerce.boolean().optional(),
})

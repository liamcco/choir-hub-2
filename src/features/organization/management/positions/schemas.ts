import z from 'zod'
import { requiredText } from '@/shared/validation'

export const PositionFormSchema = z.object({
  name: requiredText('Name is required.'),
  description: z.string().nullable().optional(),
  groupIds: z.array(z.string()),
})

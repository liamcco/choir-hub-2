import z from 'zod'
import { FINE_VOICES } from '@/core/types'

export const transferSchema = z.object({
  userId: z.string().min(1),
  choirId: z.string().min(1),
  sectionId: z.string().optional(),
  voice: z.enum(FINE_VOICES).optional(),
})

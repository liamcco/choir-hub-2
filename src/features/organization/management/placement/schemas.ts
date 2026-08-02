import z from 'zod'
import { FINE_VOICES } from '@/core/types'
import { MemberStatus } from '@/drizzle/schema'
import { requiredText } from '@/shared/validation'

export const transferSchema = z.object({
  userId: z.string().min(1),
  choirId: z.string().min(1),
  sectionId: z.string().optional(),
  voice: z.enum(FINE_VOICES).optional(),
})

export const PlacementStatusFormSchema = z.object({ status: z.enum(MemberStatus) })

export const TransferPlacementFormSchema = z.object({
  userId: requiredText('User is required.'),
  choirId: requiredText('Home Choir is required.'),
  sectionId: z.string(),
  voice: z.string(),
})

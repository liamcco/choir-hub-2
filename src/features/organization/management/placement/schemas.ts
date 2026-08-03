import z from 'zod'
import { CHOIR_ID_VALUES, SECTION_ID_VALUES } from '@/core/topology'
import { FINE_VOICES } from '@/core/types'
import { MemberStatus } from '@/drizzle/schema'
import { requiredText } from '@/shared/validation'

export const PlacementStatusFormSchema = z.object({ status: z.enum(MemberStatus) })

const ChoirIdSchema = z.enum(CHOIR_ID_VALUES)
const SectionIdSchema = z.enum(SECTION_ID_VALUES)
const FineVoiceSchema = z.enum(FINE_VOICES)

export const TransferPlacementFormSchema = z.object({
  userId: requiredText('User is required.'),
  choirId: z.union([ChoirIdSchema, z.literal('')]).pipe(z.enum(CHOIR_ID_VALUES, { error: 'Home Choir is required.' })),
  sectionId: z
    .union([SectionIdSchema, z.literal(''), z.literal('none'), z.undefined()])
    .transform((value) => (value === '' || value === 'none' ? undefined : value)),
  voice: z
    .union([FineVoiceSchema, z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
})

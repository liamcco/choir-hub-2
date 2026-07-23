import z from 'zod'
import { dateInput } from '@/shared/validation'

export const CreatePositionAssignmentFormSchema = z.object({
  userId: z.string().refine((value) => value.trim().length > 0, 'User is required.'),
  positionId: z.string().refine((value) => value.trim().length > 0, 'Position is required.'),
})

export const EndPositionAssignmentFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

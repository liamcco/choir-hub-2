import z from 'zod'
import { POSITION_ID_VALUES } from '@/core/topology'
import { dateInput, requiredText } from '@/shared/validation'

const PositionIdSchema = z.enum(POSITION_ID_VALUES)

export const CreatePositionAssignmentFormSchema = z.object({
  userId: requiredText('User is required.'),
  positionId: z
    .union([PositionIdSchema, z.literal('')])
    .pipe(z.enum(POSITION_ID_VALUES, { error: 'Position is required.' })),
})

export const EndPositionAssignmentFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

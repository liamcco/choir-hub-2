import z from 'zod'
import { dateInput, requiredText } from '@/shared/validation'

export const CreatePositionAssignmentFormSchema = z.object({
  userId: requiredText('User is required.'),
  positionId: requiredText('Position is required.'),
})

export const EndPositionAssignmentFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

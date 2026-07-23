import z from 'zod'
import { dateInput } from '@/shared/validation'

export const CreateGroupMembershipFormSchema = z.object({
  userId: z.string().refine((value) => value.trim().length > 0, 'User is required.'),
  groupId: z.string().refine((value) => value.trim().length > 0, 'Group is required.'),
})

export const EndGroupMembershipFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

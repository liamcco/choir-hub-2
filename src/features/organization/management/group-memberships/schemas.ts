import z from 'zod'
import { dateInput, requiredText } from '@/shared/validation'

export const CreateGroupMembershipFormSchema = z.object({
  userId: requiredText('User is required.'),
  groupId: requiredText('Group is required.'),
})

export const EndGroupMembershipFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

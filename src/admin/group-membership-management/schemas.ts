import z from 'zod'
import { dateInput } from '@/common/schemas'

export const CreateGroupMembershipFormSchema = z.object({
  memberId: z.string().refine((value) => value.trim().length > 0, 'Member is required.'),
  groupId: z.string().refine((value) => value.trim().length > 0, 'Group is required.'),
  startsAt: dateInput('Start date is required.'),
})

export const EndGroupMembershipFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

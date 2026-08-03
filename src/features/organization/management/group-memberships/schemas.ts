import z from 'zod'
import { GROUP_ID_VALUES } from '@/core/topology'
import { dateInput, requiredText } from '@/shared/validation'

const GroupIdSchema = z.enum(GROUP_ID_VALUES)

export const CreateGroupMembershipFormSchema = z.object({
  userId: requiredText('User is required.'),
  groupId: z.union([GroupIdSchema, z.literal('')]).pipe(z.enum(GROUP_ID_VALUES, { error: 'Group is required.' })),
})

export const EndGroupMembershipFormSchema = z.object({
  endsAt: dateInput('End date is required.'),
})

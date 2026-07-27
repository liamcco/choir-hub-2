import z from 'zod'
import { MemberStatus } from '@/drizzle/schema'
import { isEmail, requiredText } from '@/shared/validation'

export const CreateMemberAccountFormSchema = z.object({
  name: requiredText('Name is required.'),
  email: z.string().refine(isEmail),
  status: z.enum(MemberStatus),
})

export const MemberStatusSchema = z.enum(MemberStatus)

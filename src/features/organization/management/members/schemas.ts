import z from 'zod'
import { MemberStatus } from '@/drizzle/schema'
import { isEmail } from '@/shared/validation'

export const CreateMemberAccountFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0),
  email: z.string().refine(isEmail),
  status: z.enum(MemberStatus),
})

export const MemberStatusSchema = z.enum(MemberStatus)

import z from 'zod'
import { MemberStatus } from '@/prisma/generated/client'

export const CreateMemberAccountFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0),
  email: z.string().refine((value) => z.email().safeParse(value.trim()).success),
  password: z.string().min(8),
  status: z.enum(MemberStatus),
})

export const MemberStatusSchema = z.enum(MemberStatus)

export const AccountAccessStateSchema = z.enum(['enabled', 'disabled'])

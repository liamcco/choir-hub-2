'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentAccessActor, requireAdminSurfaceActor } from '@/admin/actor'
import { getMemberManagementService } from '@/admin/member-management/runtime'
import { MemberStatus } from '@/prisma/generated/client'

const createMemberAccountSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0),
  email: z.string().refine((value) => z.email().safeParse(value.trim()).success),
  password: z.string().min(8),
  status: z.enum(MemberStatus),
})

const memberStatusSchema = z.enum(MemberStatus)
const accessStateSchema = z.enum(['enabled', 'disabled'])

export async function createMemberAccountAction(formData: FormData) {
  const input = createMemberAccountSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    status: formData.get('status'),
  })

  await getMemberManagementService().then(async (service) => {
    await service.createMemberAccount(await requireActor(), input)
  })
  revalidatePath('/admin/members')
}

export async function createLinkedMemberAction(userId: string, formData: FormData) {
  const status = memberStatusSchema.parse(formData.get('status'))

  await getMemberManagementService().then(async (service) => {
    await service.createLinkedMember(await requireActor(), {
      userId,
      status,
    })
  })
  revalidatePath('/admin/members')
}

export async function updateMemberStatusAction(memberId: string, formData: FormData) {
  const status = memberStatusSchema.parse(formData.get('status'))

  await getMemberManagementService().then(async (service) => {
    await service.updateMemberStatus(await requireActor(), {
      memberId,
      status,
    })
  })
  revalidatePath('/admin/members')
}

export async function updateAccountAccessAction(userId: string, formData: FormData) {
  const accessState = accessStateSchema.parse(formData.get('accessState'))

  await getMemberManagementService().then(async (service) => {
    await service.updateAccountAccess(await requireActor(), {
      userId,
      accessState,
    })
  })
  revalidatePath('/admin/members')
}

async function requireActor() {
  return requireAdminSurfaceActor(getCurrentAccessActor, 'members')
}

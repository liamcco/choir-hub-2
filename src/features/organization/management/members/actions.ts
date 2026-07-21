'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin, requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { adminMemberPath, ROUTES } from '@/core/navigation/site'
import { memberAccountService } from '@/features/organization/management/members/service'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { AccountAccessStateSchema, CreateMemberAccountFormSchema, MemberStatusSchema } from './schemas'

export type MemberAccountFormState = FormState<typeof CreateMemberAccountFormSchema>

export async function createMemberAccountAction(
  _previousState: MemberAccountFormState,
  formData: FormData,
): Promise<MemberAccountFormState> {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const input = CreateMemberAccountFormSchema.safeParse({
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    status: String(formData.get('status')),
  })

  if (!input.success) {
    return { success: false, fieldErrors: z.flattenError(input.error).fieldErrors }
  }

  // 3. Mutate
  let member: Awaited<ReturnType<typeof memberAccountService.createLinkedAccount>>
  try {
    member = await memberAccountService.createLinkedAccount(input.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'member.create',
      subject: { type: 'member', id: member.id },
    })
    audit.accountAccessChanged({ actorUserId: actor.userId, action: 'account.create', subjectUserId: member.id })
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)

  // 5. Navigate
  redirect(adminMemberPath(member.id))
}

export async function createLinkedMemberAction(userId: string, formData: FormData) {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  const member = await memberAccountService.linkExistingUser(userId, formInput.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'member.linkExistingUser',
    subject: { type: 'member', id: member.id },
  })

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)
  revalidatePath(adminMemberPath(member.id))

  // 5. Navigate
}

export async function updateMemberStatusAction(memberId: string, formData: FormData) {
  // 1. Authenticate
  const actor = await requireCurrentUserPermission({ resource: 'member', action: 'update' })

  // 2. Validate form data
  const formInput = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  await memberAccountService.updateMemberStatus(memberId, formInput.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'member.updateStatus',
    subject: { type: 'member', id: memberId },
  })

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)
  revalidatePath(adminMemberPath(memberId))

  // 5. Navigate
}

export async function updateAccountAccessAction(userId: string, formData: FormData) {
  // 1. Authenticate
  const actor = await requireAdmin()

  // 2. Validate form data
  const formInput = AccountAccessStateSchema.safeParse(String(formData.get('accessState')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  await memberAccountService.updateAccountAccess(userId, formInput.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: `account.${formInput.data}`,
    subject: { type: 'authUser', id: userId },
  })
  audit.accountAccessChanged({ actorUserId: actor.userId, action: `account.${formInput.data}`, subjectUserId: userId })

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)
  revalidatePath(adminMemberPath(userId))

  // 5. Navigate
}

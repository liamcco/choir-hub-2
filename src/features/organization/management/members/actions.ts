'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin, requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { userService } from '@/features/organization/management/members/service'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { AccountAccessStateSchema, CreateMemberAccountFormSchema, MemberStatusSchema } from './schemas'
export type UserFormState = FormState<typeof CreateMemberAccountFormSchema> & { createdId?: string }
export async function createUserAction(_previousState: UserFormState, formData: FormData): Promise<UserFormState> {
  const actor = await requireAdmin()
  const input = CreateMemberAccountFormSchema.safeParse({
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    status: String(formData.get('status')),
  })
  if (!input.success) return { success: false, fieldErrors: z.flattenError(input.error).fieldErrors }
  try {
    const user = await userService.createUser(input.data)
    audit.adminActionCompleted({
      actorUserId: actor.userId,
      action: 'user.create',
      subject: { type: 'user', id: user.id },
    })
    audit.accountAccessChanged({ actorUserId: actor.userId, action: 'account.create', subjectUserId: user.id })
    revalidatePath(ROUTES.adminUsers)
    return { success: true, message: 'User successfully created.', createdId: user.id }
  } catch (error) {
    return handleFormError(error)
  }
}
export async function updateMemberStatusAction(userId: string, formData: FormData) {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })
  const input = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!input.success) throw new Error(z.prettifyError(input.error))
  await userService.updateMemberStatus(userId, input.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'user.updateMemberStatus',
    subject: { type: 'user', id: userId },
  })
  revalidatePath(ROUTES.adminUsers)
}
export async function updateAccountAccessAction(userId: string, formData: FormData) {
  const actor = await requireAdmin()
  const input = AccountAccessStateSchema.safeParse(String(formData.get('accessState')))
  if (!input.success) throw new Error(z.prettifyError(input.error))
  await userService.updateAccountAccess(userId, input.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: `account.${input.data}`,
    subject: { type: 'user', id: userId },
  })
  audit.accountAccessChanged({ actorUserId: actor.userId, action: `account.${input.data}`, subjectUserId: userId })
  revalidatePath(ROUTES.adminUsers)
}

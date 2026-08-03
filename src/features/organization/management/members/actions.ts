'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin, requireCurrentUserPermission } from '@/core/auth/permissions.server'
import { audit } from '@/core/logging'
import { ROUTES } from '@/core/navigation/site'
import { users } from '@/features/organization/core/users'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { userOnboarding } from './onboarding'
import { CreateMemberAccountFormSchema, MemberStatusSchema } from './schemas'

export type UserFormState = FormState<typeof CreateMemberAccountFormSchema> & { createdId?: string }

export async function createUserAction(_previousState: UserFormState, formData: FormData): Promise<UserFormState> {
  const actor = await requireAdmin()
  const input = parseFormData(CreateMemberAccountFormSchema, formData)

  if (!input.success) return { success: false, fieldErrors: input.fieldErrors }

  const result = await userOnboarding.onboardBatch(
    [{ name: input.data.name, email: input.data.email, status: input.data.status, placement: null }],
    actor.userId,
  )
  if (result.validationErrors.length > 0) return toUserFormState(result.validationErrors[0])

  const outcome = result.outcomes[0]
  if (!outcome || outcome.status === 'failed') {
    if (outcome?.status === 'failed' && outcome.cleanup === 'failed') revalidatePath(ROUTES.adminUsers)
    return outcome ? toUserFormState(outcome) : { success: false, message: 'The User could not be onboarded.' }
  }

  revalidatePath(ROUTES.adminUsers)
  return { success: true, message: 'User successfully created.', createdId: outcome.id }
}

export async function updateMemberStatusAction(userId: string, formData: FormData) {
  const actor = await requireCurrentUserPermission({ resource: 'user', action: 'update' })
  const input = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!input.success) throw new Error(z.prettifyError(input.error))
  await users.updateMemberStatus(userId, input.data)
  audit.adminActionCompleted({
    actorUserId: actor.userId,
    action: 'user.updateMemberStatus',
    subject: { type: 'user', id: userId },
  })
  revalidatePath(ROUTES.adminUsers)
}

function toUserFormState(error: { message: string; field?: string }): UserFormState {
  return {
    success: false,
    message: error.message,
    ...(error.field ? { fieldErrors: { [error.field]: error.message } } : {}),
  }
}

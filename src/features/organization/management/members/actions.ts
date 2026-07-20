'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ROUTES } from '@/core/navigation/app-routes'
import {
  createLinkedMember,
  createMemberAccount,
  updateAccountAccess,
  updateMemberStatus,
} from '@/features/organization/management/members/service'
import { handleFormError } from '@/shared/forms/errors'
import type { FormState } from '@/shared/forms/types'
import { AccountAccessStateSchema, CreateMemberAccountFormSchema, MemberStatusSchema } from './schemas'

export type MemberAccountFormState = FormState<typeof CreateMemberAccountFormSchema>

export async function createMemberAccountAction(
  _previousState: MemberAccountFormState,
  formData: FormData,
): Promise<MemberAccountFormState> {
  // 1. Authenticate

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
  try {
    await createMemberAccount(input.data)
  } catch (error) {
    return handleFormError(error)
  }

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)
  return { success: true, message: 'Member account created.' }

  // 5. Navigate
}

export async function createLinkedMemberAction(userId: string, formData: FormData) {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  await createLinkedMember(userId, formInput.data)

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)

  // 5. Navigate
}

export async function updateMemberStatusAction(memberId: string, formData: FormData) {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = MemberStatusSchema.safeParse(String(formData.get('status')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  await updateMemberStatus(memberId, formInput.data)

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)

  // 5. Navigate
}

export async function updateAccountAccessAction(userId: string, formData: FormData) {
  // 1. Authenticate

  // 2. Validate form data
  const formInput = AccountAccessStateSchema.safeParse(String(formData.get('accessState')))
  if (!formInput.success) throw new Error(z.prettifyError(formInput.error))

  // 3. Mutate
  await updateAccountAccess(userId, formInput.data)

  // 4. Invalidate
  revalidatePath(ROUTES.adminMembers)

  // 5. Navigate
}

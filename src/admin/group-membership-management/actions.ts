'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentAccessActor, requireAdminSurfaceActor } from '@/admin/actor'
import { getGroupMembershipManagementService } from '@/admin/group-membership-management/runtime'
import { GroupMembershipManagementValidationError } from '@/admin/group-membership-management/service'

export type GroupMembershipFormState = {
  message?: string
  fieldErrors?: Partial<Record<'memberId' | 'groupId' | 'startsAt' | 'endsAt', string>>
}

const createGroupMembershipFormSchema = z.object({
  memberId: z.string().refine((value) => value.trim().length > 0, 'Member is required.'),
  groupId: z.string().refine((value) => value.trim().length > 0, 'Group is required.'),
  startsAt: z.string().refine((value) => parseDateInput(value) !== null, 'Start date is required.'),
})

const endGroupMembershipFormSchema = z.object({
  endsAt: z.string().refine((value) => parseDateInput(value) !== null, 'End date is required.'),
})

export async function createGroupMembershipAction(
  _previousState: GroupMembershipFormState,
  formData: FormData,
): Promise<GroupMembershipFormState> {
  const input = parseCreateGroupMembershipForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getGroupMembershipManagementService()
    await service.createGroupMembership(await requireActor(), input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath('/admin/group-memberships')
  return { message: 'Group Membership added.' }
}

export async function endGroupMembershipAction(
  membershipId: string,
  _previousState: GroupMembershipFormState,
  formData: FormData,
): Promise<GroupMembershipFormState> {
  const input = parseEndGroupMembershipForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getGroupMembershipManagementService()
    await service.endGroupMembership(await requireActor(), membershipId, input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath('/admin/group-memberships')
  return { message: 'Group Membership ended.' }
}

function parseCreateGroupMembershipForm(
  formData: FormData,
):
  | { success: true; data: { memberId: string; groupId: string; startsAt: Date } }
  | { success: false; error: GroupMembershipFormState } {
  const parsed = createGroupMembershipFormSchema.safeParse({
    memberId: formData.get('memberId'),
    groupId: formData.get('groupId'),
    startsAt: formData.get('startsAt'),
  })

  if (!parsed.success) {
    return { success: false, error: { fieldErrors: firstFieldErrors(parsed.error) } }
  }

  return {
    success: true,
    data: {
      memberId: parsed.data.memberId,
      groupId: parsed.data.groupId,
      startsAt: parseDateInput(parsed.data.startsAt) ?? new Date(Number.NaN),
    },
  }
}

function parseEndGroupMembershipForm(
  formData: FormData,
): { success: true; data: { endsAt: Date } } | { success: false; error: GroupMembershipFormState } {
  const parsed = endGroupMembershipFormSchema.safeParse({
    endsAt: formData.get('endsAt'),
  })

  if (!parsed.success) {
    return { success: false, error: { fieldErrors: firstFieldErrors(parsed.error) } }
  }

  return {
    success: true,
    data: {
      endsAt: parseDateInput(parsed.data.endsAt) ?? new Date(Number.NaN),
    },
  }
}

function firstFieldErrors(error: z.ZodError): GroupMembershipFormState['fieldErrors'] {
  return Object.fromEntries(
    Object.entries(z.flattenError(error).fieldErrors as Record<string, string[]>).map(([field, errors]) => [
      field,
      errors?.[0] ?? 'Invalid value.',
    ]),
  )
}

function parseDateInput(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function handleFormError(error: unknown): GroupMembershipFormState {
  if (error instanceof GroupMembershipManagementValidationError) {
    return {
      message: error.message,
      fieldErrors: error.fieldErrors,
    }
  }
  throw error
}

async function requireActor() {
  return requireAdminSurfaceActor(getCurrentAccessActor, 'organization-admin')
}

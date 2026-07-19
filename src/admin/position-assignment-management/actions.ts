'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentAccessActor, requireAdminSurfaceActor } from '@/admin/actor'
import { getPositionAssignmentManagementService } from '@/admin/position-assignment-management/runtime'
import { PositionAssignmentManagementValidationError } from '@/admin/position-assignment-management/service'
import { ROUTES } from '@/lib/route-access'

export type PositionAssignmentFormState = {
  message?: string
  fieldErrors?: Partial<Record<'memberId' | 'positionId' | 'startsAt' | 'endsAt', string>>
}

const createPositionAssignmentFormSchema = z.object({
  memberId: z.string().refine((value) => value.trim().length > 0, 'Member is required.'),
  positionId: z.string().refine((value) => value.trim().length > 0, 'Position is required.'),
  startsAt: z.string().refine((value) => parseDateInput(value) !== null, 'Start date is required.'),
})

const endPositionAssignmentFormSchema = z.object({
  endsAt: z.string().refine((value) => parseDateInput(value) !== null, 'End date is required.'),
})

export async function createPositionAssignmentAction(
  _previousState: PositionAssignmentFormState,
  formData: FormData,
): Promise<PositionAssignmentFormState> {
  const input = parseCreatePositionAssignmentForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getPositionAssignmentManagementService()
    await service.createPositionAssignment(await requireActor(), input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminPositionAssignments)
  return { message: 'Position Assignment added.' }
}

export async function endPositionAssignmentAction(
  assignmentId: string,
  _previousState: PositionAssignmentFormState,
  formData: FormData,
): Promise<PositionAssignmentFormState> {
  const input = parseEndPositionAssignmentForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getPositionAssignmentManagementService()
    await service.endPositionAssignment(await requireActor(), assignmentId, input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminPositionAssignments)
  return { message: 'Position Assignment ended.' }
}

function parseCreatePositionAssignmentForm(
  formData: FormData,
):
  | { success: true; data: { memberId: string; positionId: string; startsAt: Date } }
  | { success: false; error: PositionAssignmentFormState } {
  const parsed = createPositionAssignmentFormSchema.safeParse({
    memberId: formData.get('memberId'),
    positionId: formData.get('positionId'),
    startsAt: formData.get('startsAt'),
  })

  if (!parsed.success) {
    return { success: false, error: { fieldErrors: firstFieldErrors(parsed.error) } }
  }

  return {
    success: true,
    data: {
      memberId: parsed.data.memberId,
      positionId: parsed.data.positionId,
      startsAt: parseDateInput(parsed.data.startsAt) ?? new Date(Number.NaN),
    },
  }
}

function parseEndPositionAssignmentForm(
  formData: FormData,
): { success: true; data: { endsAt: Date } } | { success: false; error: PositionAssignmentFormState } {
  const parsed = endPositionAssignmentFormSchema.safeParse({
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

function firstFieldErrors(error: z.ZodError): PositionAssignmentFormState['fieldErrors'] {
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

function handleFormError(error: unknown): PositionAssignmentFormState {
  if (error instanceof PositionAssignmentManagementValidationError) {
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

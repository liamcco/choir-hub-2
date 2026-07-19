'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentAccessActor, requireAdminSurfaceActor } from '@/admin/actor'
import { getPositionManagementService } from '@/admin/position-management/runtime'
import { PositionManagementValidationError } from '@/admin/position-management/service'
import { ROUTES } from '@/lib/route-access'

export type PositionFormState = {
  message?: string
  fieldErrors?: Partial<Record<'name' | 'description' | 'groupIds', string>>
}

const positionFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Name is required.'),
  description: z.string().optional(),
  groupIds: z.array(z.string()),
})

export async function createPositionAction(
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  const input = parsePositionForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getPositionManagementService()
    await service.createPosition(await requireActor(), input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminPositions)
  return { message: 'Position created.' }
}

export async function updatePositionAction(
  positionId: string,
  _previousState: PositionFormState,
  formData: FormData,
): Promise<PositionFormState> {
  const input = parsePositionForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getPositionManagementService()
    await service.updatePosition(await requireActor(), positionId, input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminPositions)
  return { message: 'Position updated.' }
}

function parsePositionForm(formData: FormData):
  | {
      success: true
      data: {
        name: string
        description: string | null
        groupIds: string[]
      }
    }
  | { success: false; error: PositionFormState } {
  const parsed = positionFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    groupIds: formData.getAll('groupIds'),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: {
        fieldErrors: Object.fromEntries(
          Object.entries(z.flattenError(parsed.error).fieldErrors).map(([field, errors]) => [
            field,
            errors?.[0] ?? 'Invalid value.',
          ]),
        ),
      },
    }
  }

  return {
    success: true,
    data: {
      name: parsed.data.name,
      description: normalizeOptionalString(parsed.data.description),
      groupIds: parsed.data.groupIds,
    },
  }
}

function handleFormError(error: unknown): PositionFormState {
  if (error instanceof PositionManagementValidationError) {
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

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

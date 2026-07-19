'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getGroupManagementService } from '@/admin/group-management/runtime'
import { GroupManagementValidationError } from '@/admin/group-management/service'
import { getCurrentAccessActor, requireAdminSurfaceActor } from '@/admin/shell/actor'
import { ROUTES } from '@/lib/route-access'
import { GroupKind } from '@/prisma/generated/client'

export type GroupFormState = {
  message?: string
  fieldErrors?: Partial<Record<'name' | 'description' | 'kind' | 'parentGroupId', string>>
}

const groupFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Name is required.'),
  description: z.string().optional(),
  kind: z.enum(GroupKind),
  parentGroupId: z.string().optional(),
})

export async function createGroupAction(_previousState: GroupFormState, formData: FormData): Promise<GroupFormState> {
  const input = parseGroupForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getGroupManagementService()
    await service.createGroup(await requireActor(), input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminGroups)
  return { message: 'Group created.' }
}

export async function updateGroupAction(
  groupId: string,
  _previousState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  const input = parseGroupForm(formData)
  if (!input.success) {
    return input.error
  }

  try {
    const service = await getGroupManagementService()
    await service.updateGroup(await requireActor(), groupId, input.data)
  } catch (error) {
    return handleFormError(error)
  }

  revalidatePath(ROUTES.adminGroups)
  return { message: 'Group updated.' }
}

function parseGroupForm(formData: FormData):
  | {
      success: true
      data: {
        kind: GroupKind
        name: string
        description: string | null
        parentGroupId: string | null
      }
    }
  | { success: false; error: GroupFormState } {
  const parsed = groupFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    kind: formData.get('kind'),
    parentGroupId: formData.get('parentGroupId') ?? undefined,
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
      kind: parsed.data.kind,
      name: parsed.data.name,
      description: normalizeOptionalString(parsed.data.description),
      parentGroupId: normalizeOptionalString(parsed.data.parentGroupId),
    },
  }
}

function handleFormError(error: unknown): GroupFormState {
  if (error instanceof GroupManagementValidationError) {
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

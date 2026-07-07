'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/db'
import { auth } from '@/lib/auth'

import { requireAdminSession } from './data'
import type { AdminActionState } from './types'

const idleState: AdminActionState = { status: 'idle' }

const idSchema = z.string().min(1)
const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const userBasicsSchema = z.object({
  displayUsername: optionalTextSchema,
  email: z.email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1, 'Name is required.'),
  userId: idSchema,
  username: optionalTextSchema,
})

const createUserSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1, 'Name is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional().or(z.literal('')),
  role: z.enum(['user', 'admin']),
  username: optionalTextSchema,
})

const userRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
  userId: idSchema,
})

const banUserSchema = z.object({
  banExpiresIn: z.coerce.number().int().positive().optional().or(z.literal('')),
  banReason: z.string().trim().optional(),
  userId: idSchema,
})

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  userId: idSchema,
})

const userIdSchema = z.object({
  userId: idSchema,
})

const membershipSchema = z.object({
  groupId: idSchema,
  userId: idSchema,
})

const positionAssignmentSchema = z.object({
  positionId: idSchema,
  userId: idSchema,
})

const groupKindSchema = z.object({
  description: optionalTextSchema,
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required.'),
})

const groupSchema = z.object({
  description: optionalTextSchema,
  id: z.string().optional(),
  isContainer: z.enum(['on']).optional(),
  kindId: idSchema,
  name: z.string().trim().min(1, 'Name is required.'),
  parentGroupId: optionalTextSchema,
})

const positionSchema = z.object({
  description: optionalTextSchema,
  groupIds: z.array(z.string()).default([]),
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required.'),
})

function formValue(formData: FormData, key: string) {
  return formData.get(key)
}

function formString(formData: FormData, key: string) {
  const value = formValue(formData, key)
  return typeof value === 'string' ? value : ''
}

function formStringArray(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === 'string')
}

function fail(error: unknown): AdminActionState {
  if (error instanceof z.ZodError) {
    return {
      message: error.issues[0]?.message ?? 'Invalid form data.',
      status: 'error',
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 'error',
    }
  }

  return {
    message: 'Something went wrong.',
    status: 'error',
  }
}

function ok(message: string): AdminActionState {
  revalidatePath('/admin', 'layout')
  return { message, status: 'success' }
}

export async function updateUserBasicsAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = userBasicsSchema.parse({
      displayUsername: formString(formData, 'displayUsername'),
      email: formString(formData, 'email'),
      name: formString(formData, 'name'),
      userId: formString(formData, 'userId'),
      username: formString(formData, 'username'),
    })

    await auth.api.adminUpdateUser({
      body: {
        data: {
          displayUsername: parsed.displayUsername,
          email: parsed.email,
          name: parsed.name,
          username: parsed.username,
        },
        userId: parsed.userId,
      },
      headers: requestHeaders,
    })

    return ok('User updated.')
  } catch (error) {
    return fail(error)
  }
}

export async function createUserAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = createUserSchema.parse({
      email: formString(formData, 'email'),
      name: formString(formData, 'name'),
      password: formString(formData, 'password'),
      role: formString(formData, 'role'),
      username: formString(formData, 'username'),
    })

    await auth.api.createUser({
      body: {
        data: {
          username: parsed.username,
        },
        email: parsed.email,
        name: parsed.name,
        password: parsed.password || undefined,
        role: parsed.role,
      },
      headers: requestHeaders,
    })

    return ok('User created.')
  } catch (error) {
    return fail(error)
  }
}

export async function setUserRoleAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = userRoleSchema.parse({
      role: formString(formData, 'role'),
      userId: formString(formData, 'userId'),
    })

    await auth.api.setRole({
      body: parsed,
      headers: requestHeaders,
    })

    return ok('Role updated.')
  } catch (error) {
    return fail(error)
  }
}

export async function banUserAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = banUserSchema.parse({
      banExpiresIn: formString(formData, 'banExpiresIn'),
      banReason: formString(formData, 'banReason'),
      userId: formString(formData, 'userId'),
    })

    await auth.api.banUser({
      body: {
        banExpiresIn: parsed.banExpiresIn === '' ? undefined : parsed.banExpiresIn,
        banReason: parsed.banReason || undefined,
        userId: parsed.userId,
      },
      headers: requestHeaders,
    })

    return ok('User banned.')
  } catch (error) {
    return fail(error)
  }
}

export async function unbanUserAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = userIdSchema.parse({
      userId: formString(formData, 'userId'),
    })

    await auth.api.unbanUser({
      body: parsed,
      headers: requestHeaders,
    })

    return ok('User unbanned.')
  } catch (error) {
    return fail(error)
  }
}

export async function setUserPasswordAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = passwordSchema.parse({
      newPassword: formString(formData, 'newPassword'),
      userId: formString(formData, 'userId'),
    })

    await auth.api.setUserPassword({
      body: parsed,
      headers: requestHeaders,
    })

    return ok('Password set.')
  } catch (error) {
    return fail(error)
  }
}

export async function revokeUserSessionsAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = userIdSchema.parse({
      userId: formString(formData, 'userId'),
    })

    await auth.api.revokeUserSessions({
      body: parsed,
      headers: requestHeaders,
    })

    return ok('Sessions revoked.')
  } catch (error) {
    return fail(error)
  }
}

export async function removeUserAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    const { requestHeaders } = await requireAdminSession()
    const parsed = userIdSchema.parse({
      userId: formString(formData, 'userId'),
    })

    await auth.api.removeUser({
      body: parsed,
      headers: requestHeaders,
    })

    return ok('User removed.')
  } catch (error) {
    return fail(error)
  }
}

export async function addUserToGroupAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = membershipSchema.parse({
      groupId: formString(formData, 'groupId'),
      userId: formString(formData, 'userId'),
    })

    await prisma.userGroupMembership.upsert({
      create: parsed,
      update: {},
      where: {
        userId_groupId: parsed,
      },
    })

    return ok('Group assigned.')
  } catch (error) {
    return fail(error)
  }
}

export async function removeUserFromGroupAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = membershipSchema.parse({
      groupId: formString(formData, 'groupId'),
      userId: formString(formData, 'userId'),
    })

    await prisma.userGroupMembership.delete({
      where: {
        userId_groupId: parsed,
      },
    })

    return ok('Group removed.')
  } catch (error) {
    return fail(error)
  }
}

export async function assignPositionToUserAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = positionAssignmentSchema.parse({
      positionId: formString(formData, 'positionId'),
      userId: formString(formData, 'userId'),
    })

    await prisma.position.update({
      data: {
        currentHolderUserId: parsed.userId,
        heldSince: new Date(),
      },
      where: {
        id: parsed.positionId,
      },
    })

    return ok('Position assigned.')
  } catch (error) {
    return fail(error)
  }
}

export async function unassignPositionAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = z
      .object({
        positionId: idSchema,
      })
      .parse({
        positionId: formString(formData, 'positionId'),
      })

    await prisma.position.update({
      data: {
        currentHolderUserId: null,
        heldSince: null,
      },
      where: {
        id: parsed.positionId,
      },
    })

    return ok('Position unassigned.')
  } catch (error) {
    return fail(error)
  }
}

export async function saveGroupKindAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = groupKindSchema.parse({
      description: formString(formData, 'description'),
      id: formString(formData, 'id') || undefined,
      name: formString(formData, 'name'),
    })

    await prisma.groupKind.upsert({
      create: {
        description: parsed.description,
        name: parsed.name,
      },
      update: {
        description: parsed.description,
        name: parsed.name,
      },
      where: {
        id: parsed.id ?? '',
      },
    })

    return ok(parsed.id ? 'Group kind updated.' : 'Group kind created.')
  } catch (error) {
    return fail(error)
  }
}

export async function deleteGroupKindAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = z.object({ id: idSchema }).parse({ id: formString(formData, 'id') })

    await prisma.groupKind.delete({
      where: {
        id: parsed.id,
      },
    })

    return ok('Group kind deleted.')
  } catch (error) {
    return fail(error)
  }
}

export async function saveGroupAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = groupSchema.parse({
      description: formString(formData, 'description'),
      id: formString(formData, 'id') || undefined,
      isContainer: formString(formData, 'isContainer') || undefined,
      kindId: formString(formData, 'kindId'),
      name: formString(formData, 'name'),
      parentGroupId: formString(formData, 'parentGroupId'),
    })

    if (parsed.id && parsed.parentGroupId === parsed.id) {
      return { message: 'A group cannot be its own parent.', status: 'error' }
    }

    await prisma.group.upsert({
      create: {
        description: parsed.description,
        isContainer: parsed.isContainer === 'on',
        kindId: parsed.kindId,
        name: parsed.name,
        parentGroupId: parsed.parentGroupId,
      },
      update: {
        description: parsed.description,
        isContainer: parsed.isContainer === 'on',
        kindId: parsed.kindId,
        name: parsed.name,
        parentGroupId: parsed.parentGroupId,
      },
      where: {
        id: parsed.id ?? '',
      },
    })

    return ok(parsed.id ? 'Group updated.' : 'Group created.')
  } catch (error) {
    return fail(error)
  }
}

export async function deleteGroupAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = z.object({ id: idSchema }).parse({ id: formString(formData, 'id') })

    await prisma.group.delete({
      where: {
        id: parsed.id,
      },
    })

    return ok('Group deleted.')
  } catch (error) {
    return fail(error)
  }
}

export async function savePositionAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = positionSchema.parse({
      description: formString(formData, 'description'),
      groupIds: formStringArray(formData, 'groupIds'),
      id: formString(formData, 'id') || undefined,
      name: formString(formData, 'name'),
    })

    await prisma.$transaction(async (tx) => {
      const position = await tx.position.upsert({
        create: {
          description: parsed.description,
          name: parsed.name,
        },
        update: {
          description: parsed.description,
          name: parsed.name,
        },
        where: {
          id: parsed.id ?? '',
        },
      })

      await tx.positionGroup.deleteMany({
        where: {
          positionId: position.id,
        },
      })

      if (parsed.groupIds.length > 0) {
        await tx.positionGroup.createMany({
          data: parsed.groupIds.map((groupId) => ({
            groupId,
            positionId: position.id,
          })),
          skipDuplicates: true,
        })
      }
    })

    return ok(parsed.id ? 'Position updated.' : 'Position created.')
  } catch (error) {
    return fail(error)
  }
}

export async function deletePositionAction(
  _state: AdminActionState = idleState,
  formData: FormData,
): Promise<AdminActionState> {
  void _state
  try {
    await requireAdminSession()
    const parsed = z.object({ id: idSchema }).parse({ id: formString(formData, 'id') })

    await prisma.position.delete({
      where: {
        id: parsed.id,
      },
    })

    return ok('Position deleted.')
  } catch (error) {
    return fail(error)
  }
}

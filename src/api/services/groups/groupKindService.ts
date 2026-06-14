import { z } from 'zod'

import { createGroupKindRequestSchema, groupKindSchema, updateGroupKindRequestSchema } from '@/api/models/group'
import { prisma } from '@/db'

import { ApiError } from '@/api/errors'
import { assertUniqueGroupKindName } from './assertions'

type CreateGroupKindInput = z.infer<typeof createGroupKindRequestSchema>
type UpdateGroupKindInput = z.infer<typeof updateGroupKindRequestSchema>
type GroupKind = z.infer<typeof groupKindSchema>

export async function getGroupKinds(): Promise<GroupKind[]> {
  return prisma.groupKind.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getGroupKindById(id: string): Promise<GroupKind> {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
  })

  if (!groupKind) {
    throw new ApiError('Group kind not found', 404)
  }

  return groupKind
}

export async function createGroupKind(input: CreateGroupKindInput): Promise<GroupKind> {
  await assertUniqueGroupKindName(input.name)

  return prisma.groupKind.create({
    data: input,
  })
}

export async function updateGroupKind(id: string, input: UpdateGroupKindInput): Promise<GroupKind> {
  const groupKind = await getGroupKindById(id)

  if (input.name && input.name !== groupKind.name) {
    await assertUniqueGroupKindName(input.name)
  }

  return prisma.groupKind.update({
    where: { id },
    data: input,
  })
}

export async function deleteGroupKind(id: string): Promise<void> {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
    select: {
      id: true,
      groups: {
        select: { id: true },
      },
    },
  })

  if (!groupKind) {
    throw new ApiError('Group kind not found', 404)
  }

  if (groupKind.groups.length > 0) {
    throw new ApiError('A group kind used by groups cannot be deleted', 409)
  }

  await prisma.groupKind.delete({
    where: { id },
  })
}

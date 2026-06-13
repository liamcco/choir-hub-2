import { z } from 'zod'

import { createGroupKindSchema, updateGroupKindSchema } from '@/api/models/groups.mutate'
import { prisma } from '@/db'

import { assertUniqueGroupKindName } from './assertions'
import { GroupServiceError } from './errors'

type CreateGroupKindInput = z.infer<typeof createGroupKindSchema>
type UpdateGroupKindInput = z.infer<typeof updateGroupKindSchema>

export async function getGroupKinds() {
  return await prisma.groupKind.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getGroupKindById(id: string) {
  return await prisma.groupKind.findUnique({
    where: { id },
  })
}

export async function createGroupKind(input: CreateGroupKindInput) {
  await assertUniqueGroupKindName(input.name)

  return await prisma.groupKind.create({
    data: input,
  })
}

export async function updateGroupKind(id: string, input: UpdateGroupKindInput) {
  const groupKind = await getGroupKindById(id)

  if (!groupKind) {
    throw new GroupServiceError('Group kind not found', 404)
  }

  if (input.name && input.name !== groupKind.name) {
    await assertUniqueGroupKindName(input.name)
  }

  return await prisma.groupKind.update({
    where: { id },
    data: input,
  })
}

export async function deleteGroupKind(id: string) {
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
    throw new GroupServiceError('Group kind not found', 404)
  }

  if (groupKind.groups.length > 0) {
    throw new GroupServiceError('A group kind used by groups cannot be deleted', 409)
  }

  await prisma.groupKind.delete({
    where: { id },
  })
}

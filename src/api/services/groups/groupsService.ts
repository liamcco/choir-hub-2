import { z } from 'zod'

import { prisma } from '@/db'

import { createGroupSchema, updateGroupSchema } from '@/api/models/groups.mutate'
import {
  assertGroupKindExists,
  assertGroupParentDoesNotCreateCycle,
  assertParentGroupExists,
  assertUniqueGroupName,
} from './assertions'
import { GroupServiceError } from './errors'

type CreateGroupInput = z.infer<typeof createGroupSchema>
type UpdateGroupInput = z.infer<typeof updateGroupSchema>

export async function getGroups() {
  return await prisma.group.findMany({
    include: {
      kind: true,
    },
    orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
  })
}

export async function getGroupById(id: string) {
  return await prisma.group.findUnique({
    where: { id },
    include: {
      kind: true,
    },
  })
}

export async function createGroup(input: CreateGroupInput) {
  const parentGroupId = input.parentGroupId ?? null

  await assertGroupKindExists(input.kindId)
  await assertParentGroupExists(parentGroupId)
  await assertUniqueGroupName(input.name, parentGroupId)

  return await prisma.group.create({
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      active: input.active,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: true,
    },
  })
}

export async function updateGroup(id: string, input: UpdateGroupInput) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        select: { id: true },
      },
    },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  const parentGroupId = Object.hasOwn(input, 'parentGroupId') ? (input.parentGroupId ?? null) : group.parentGroupId
  const name = input.name ?? group.name

  if (input.kindId) {
    await assertGroupKindExists(input.kindId)
  }

  await assertParentGroupExists(parentGroupId)
  await assertGroupParentDoesNotCreateCycle(id, parentGroupId)

  if (name !== group.name || parentGroupId !== group.parentGroupId) {
    await assertUniqueGroupName(name, parentGroupId, id)
  }

  if (input.isContainer === true && group.memberships.length > 0) {
    throw new GroupServiceError('A group with direct memberships cannot be converted to a container group', 409)
  }

  return await prisma.group.update({
    where: { id },
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      active: input.active,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: true,
    },
  })
}

export async function deleteGroup(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      childGroups: {
        select: { id: true },
      },
    },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  if (group.childGroups.length > 0) {
    throw new GroupServiceError('A group with child groups cannot be deleted', 409)
  }

  await prisma.group.delete({
    where: { id },
  })
}

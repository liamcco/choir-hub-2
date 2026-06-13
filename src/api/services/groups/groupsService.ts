import { z } from 'zod'

import { prisma } from '@/db'

import { createGroupRequestSchema, groupSchema, updateGroupRequestSchema } from '@/api/models/group'
import {
  assertGroupKindExists,
  assertGroupParentDoesNotCreateCycle,
  assertParentGroupExists,
  assertUniqueGroupName,
} from './assertions'
import { GroupServiceError } from './errors'

type Group = z.infer<typeof groupSchema>

export async function getGroups(): Promise<Array<Group>> {
  const groups = await prisma.group.findMany({
    include: {
      kind: true,
    },
  })

  return groups.map((group) =>
    groupSchema.parse({
      ...group,
      kindName: group.kind.name,
    }),
  )
}

export async function getGroupById(id: string): Promise<Group> {
  const groupsWithKinds = await prisma.group.findUnique({
    where: { id },
    include: {
      kind: true,
    },
  })

  if (!groupsWithKinds) {
    throw new GroupServiceError('Group not found', 404)
  }

  return groupSchema.parse({
    ...groupsWithKinds,
    kindName: groupsWithKinds.kind.name,
  })
}

type CreateGroupInput = z.infer<typeof createGroupRequestSchema>

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const parentGroupId = input.parentGroupId ?? null

  await assertGroupKindExists(input.kindId)
  await assertParentGroupExists(parentGroupId)
  await assertUniqueGroupName(input.name, parentGroupId)

  const { kind, ...createdGroup } = await prisma.group.create({
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: {
        select: { name: true },
      },
    },
  })
  return {
    ...createdGroup,
    kindName: kind.name,
  }
}

type UpdateGroupInput = z.infer<typeof updateGroupRequestSchema>

export async function updateGroup(groupId: string, input: UpdateGroupInput): Promise<Group> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
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
  await assertGroupParentDoesNotCreateCycle(groupId, parentGroupId)

  if (name !== group.name || parentGroupId !== group.parentGroupId) {
    await assertUniqueGroupName(name, parentGroupId, groupId)
  }

  if (input.isContainer === true && group.memberships.length > 0) {
    throw new GroupServiceError('A group with direct memberships cannot be converted to a container group', 409)
  }

  const { kind, ...updatedGroup } = await prisma.group.update({
    where: { id: groupId },
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: true,
    },
  })

  return {
    ...updatedGroup,
    kindName: kind.name,
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
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
    where: { id: groupId },
  })
}

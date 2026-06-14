import { z } from 'zod'

import { prisma } from '@/db'

import { createGroupRequestSchema, groupSchema, updateGroupRequestSchema } from '@/api/models/group'
import { ApiError } from '@/api/errors'
import {
  assertGroupKindExists,
  assertGroupParentDoesNotCreateCycle,
  assertParentGroupExists,
  assertUniqueGroupName,
} from './assertions'

type Group = z.infer<typeof groupSchema>
type GroupHierarchyNode = {
  id: string
  parentGroupId: string | null
}
type GroupMembershipNode = {
  groupId: string
  userId: string
}

export async function getGroups(): Promise<Array<Group>> {
  const [groups, memberships] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
      include: {
        kind: true,
      },
    }),
    prisma.userGroupMembership.findMany({
      select: {
        groupId: true,
        userId: true,
      },
    }),
  ])
  const effectiveMemberCounts = getEffectiveMemberCounts(groups, memberships)

  return groups.map((group) =>
    groupSchema.parse({
      ...group,
      kindName: group.kind.name,
      effectiveMemberCount: effectiveMemberCounts.get(group.id) ?? 0,
    }),
  )
}

export async function getGroupById(id: string): Promise<Group> {
  const [groupsWithKinds, groups, memberships] = await Promise.all([
    prisma.group.findUnique({
      where: { id },
      include: {
        kind: true,
      },
    }),
    prisma.group.findMany({
      select: {
        id: true,
        parentGroupId: true,
      },
    }),
    prisma.userGroupMembership.findMany({
      select: {
        groupId: true,
        userId: true,
      },
    }),
  ])

  if (!groupsWithKinds) {
    throw new ApiError('Group not found', 404)
  }

  const effectiveMemberCounts = getEffectiveMemberCounts(groups, memberships)

  return groupSchema.parse({
    ...groupsWithKinds,
    kindName: groupsWithKinds.kind.name,
    effectiveMemberCount: effectiveMemberCounts.get(groupsWithKinds.id) ?? 0,
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
    effectiveMemberCount: 0,
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
    throw new ApiError('Group not found', 404)
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
    throw new ApiError('A group with direct memberships cannot be converted to a container group', 409)
  }

  const [{ kind, ...updatedGroup }, effectiveMemberCount] = await Promise.all([
    prisma.group.update({
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
    }),
    getEffectiveMemberCount(groupId),
  ])

  return {
    ...updatedGroup,
    kindName: kind.name,
    effectiveMemberCount,
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
    throw new ApiError('Group not found', 404)
  }

  if (group.childGroups.length > 0) {
    throw new ApiError('A group with child groups cannot be deleted', 409)
  }

  await prisma.group.delete({
    where: { id: groupId },
  })
}

async function getEffectiveMemberCount(groupId: string) {
  const [groups, memberships] = await Promise.all([
    prisma.group.findMany({
      select: {
        id: true,
        parentGroupId: true,
      },
    }),
    prisma.userGroupMembership.findMany({
      select: {
        groupId: true,
        userId: true,
      },
    }),
  ])

  return getEffectiveMemberCounts(groups, memberships).get(groupId) ?? 0
}

function getEffectiveMemberCounts(groups: GroupHierarchyNode[], memberships: GroupMembershipNode[]) {
  const parentByGroupId = new Map(groups.map((group) => [group.id, group.parentGroupId]))
  const memberIdsByGroupId = new Map<string, Set<string>>()

  for (const membership of memberships) {
    let currentGroupId: string | null = membership.groupId
    const visitedGroupIds = new Set<string>()

    while (currentGroupId && !visitedGroupIds.has(currentGroupId)) {
      visitedGroupIds.add(currentGroupId)

      const memberIds = memberIdsByGroupId.get(currentGroupId) ?? new Set<string>()
      memberIds.add(membership.userId)
      memberIdsByGroupId.set(currentGroupId, memberIds)

      currentGroupId = parentByGroupId.get(currentGroupId) ?? null
    }
  }

  return new Map([...memberIdsByGroupId.entries()].map(([groupId, memberIds]) => [groupId, memberIds.size]))
}

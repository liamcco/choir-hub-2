import { z } from 'zod'

import { prisma } from '@/db'

import { groupMemberSchema } from '@/api/models/group'
import { ApiError } from '@/api/errors'
import { assertGroupExists, getDescendantGroupIds } from './assertions'

type GroupMember = z.infer<typeof groupMemberSchema>

export async function getGroupMembers(groupId: string, onlyDirectMembers = false): Promise<GroupMember[]> {
  await assertGroupExists(groupId)

  const directMemberships = await prisma.userGroupMembership.findMany({
    where: { groupId },
    orderBy: {
      addedAt: 'asc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  const directMembers = directMemberships.map((membership) =>
    groupMemberSchema.parse({
      userId: membership.userId,
      name: membership.user.name,
      isDirect: true,
      addedAt: membership.addedAt,
    }),
  )

  if (onlyDirectMembers) {
    return directMembers
  }

  const descendantGroupIds = await getDescendantGroupIds(groupId)

  if (descendantGroupIds.length === 0) {
    return directMembers
  }

  const descendantMemberships = await prisma.userGroupMembership.findMany({
    where: {
      groupId: { in: descendantGroupIds },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  const membersByUserId = new Map(directMembers.map((member) => [member.userId, member]))

  for (const membership of descendantMemberships) {
    if (membersByUserId.has(membership.userId)) {
      continue
    }

    membersByUserId.set(
      membership.userId,
      groupMemberSchema.parse({
        userId: membership.userId,
        name: membership.user.name,
        isDirect: false,
        addedAt: null,
      }),
    )
  }

  return [...membersByUserId.values()]
}

export async function createGroupMembership(groupId: string, userId: string) {
  const [group, user] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        isContainer: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }),
  ])

  if (!group) {
    throw new ApiError('Group not found', 404)
  }

  if (group.isContainer) {
    throw new ApiError('Direct memberships cannot be added to container groups', 409)
  }

  if (!user) {
    throw new ApiError('User not found', 404)
  }

  const existingMembership = await prisma.userGroupMembership.findUnique({
    where: {
      userId_groupId: {
        userId: userId,
        groupId,
      },
    },
  })

  if (existingMembership) {
    throw new ApiError('User is already a direct member of this group', 409)
  }

  return prisma.userGroupMembership.create({
    data: {
      userId: userId,
      groupId,
    },
  })
}

export async function deleteGroupMembership(groupId: string, userId: string) {
  const membership = await prisma.userGroupMembership.findUnique({
    where: { userId_groupId: { userId: userId, groupId } },
  })

  if (!membership || membership.groupId !== groupId) {
    throw new ApiError('Membership not found', 404)
  }

  await prisma.userGroupMembership.delete({
    where: { id: membership.id },
  })
}

import { z } from 'zod'

import { prisma } from '@/db'

import { groupMemberSchema } from '@/api/models/group'
import { ApiError } from '@/api/errors'
import { getDescendantGroupIdsFromHierarchy } from './hierarchy'

type GroupMember = z.infer<typeof groupMemberSchema>

export async function getGroupMembers(groupId: string, onlyDirectMembers = false): Promise<GroupMember[]> {
  const [group, directMemberships] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    }),
    prisma.userGroupMembership.findMany({
      where: { groupId },
      orderBy: {
        addedAt: 'asc',
      },
      select: {
        userId: true,
        addedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  if (!group) {
    throw new ApiError('Group not found', 404)
  }

  const directMembers = directMemberships.map(toDirectGroupMember)

  if (onlyDirectMembers) {
    return directMembers
  }

  const groups = await prisma.group.findMany({
    select: {
      id: true,
      parentGroupId: true,
    },
  })
  const descendantGroupIds = getDescendantGroupIdsFromHierarchy(groupId, groups)

  if (descendantGroupIds.length === 0) {
    return directMembers
  }

  const descendantMemberships = await prisma.userGroupMembership.findMany({
    where: {
      groupId: { in: descendantGroupIds },
    },
    select: {
      userId: true,
      addedAt: true,
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
      toEffectiveGroupMember({
        userId: membership.userId,
        addedAt: null,
        user: membership.user,
      }),
    )
  }

  return [...membersByUserId.values()]
}

export async function createGroupMembership(groupId: string, userId: string): Promise<GroupMember> {
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
      select: { id: true, name: true },
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

  try {
    const membership = await prisma.userGroupMembership.create({
      data: {
        userId: userId,
        groupId,
      },
      select: {
        userId: true,
        addedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return toDirectGroupMember(membership)
  } catch (error) {
    if (isPrismaRequestError(error, 'P2002')) {
      throw new ApiError('User is already a direct member of this group', 409)
    }

    throw error
  }
}

export async function deleteGroupMembership(groupId: string, userId: string) {
  const result = await prisma.userGroupMembership.deleteMany({
    where: { userId: userId, groupId },
  })

  if (result.count === 0) {
    throw new ApiError('Membership not found', 404)
  }
}

function toDirectGroupMember(membership: {
  userId: string
  addedAt: Date | null
  user: { name: string }
}) {
  return groupMemberSchema.parse({
    userId: membership.userId,
    name: membership.user.name,
    isDirect: true,
    addedAt: membership.addedAt,
  })
}

function toEffectiveGroupMember(membership: {
  userId: string
  addedAt: Date | null
  user: { name: string }
}) {
  return groupMemberSchema.parse({
    userId: membership.userId,
    name: membership.user.name,
    isDirect: false,
    addedAt: membership.addedAt,
  })
}

function isPrismaRequestError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code === code
  )
}

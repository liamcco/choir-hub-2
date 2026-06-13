import { z } from 'zod'

import { prisma } from '@/db'

import { createMembershipRequestSchema, groupMemberSchema } from '@/api/models/group'
import { assertGroupExists } from './assertions'
import { GroupServiceError } from './errors'

type CreateMembershipInput = z.infer<typeof createMembershipRequestSchema>
type GroupMember = z.infer<typeof groupMemberSchema>

export async function getGroupMembers(groupId: string, onlyDirectMembers = false): Promise<GroupMember[]> {
  await assertGroupExists(groupId)

  const directMemberships = await prisma.personGroupMembership.findMany({
    where: { groupId },
    orderBy: {
      addedAt: 'asc',
    },
  })

  const directMembers = directMemberships.map((membership) =>
    groupMemberSchema.parse({ userId: membership.personId, isDirect: true, addedAt: membership.addedAt }),
  )

  // Simple case: the caller only wants people directly assigned to this group.
  if (onlyDirectMembers) {
    return directMembers
  }

  const descendantGroupIds: string[] = []
  let currentParentGroupIds = [groupId]

  while (currentParentGroupIds.length > 0) {
    const childGroups = await prisma.group.findMany({
      where: {
        parentGroupId: {
          in: currentParentGroupIds,
        },
      },
      select: {
        id: true,
      },
    })

    currentParentGroupIds = childGroups.map((group) => group.id)
    descendantGroupIds.push(...currentParentGroupIds)
  }

  if (descendantGroupIds.length === 0) {
    return directMembers
  }

  const descendantMemberships = await prisma.personGroupMembership.findMany({
    where: {
      groupId: { in: descendantGroupIds },
    },
    orderBy: {
      addedAt: 'asc',
    },
  })

  const directMemberIds = new Set(directMembers.map((member) => member.userId))

  const descendantMemberIds = [
    ...new Set(
      descendantMemberships
        .map((membership) => membership.personId)
        .filter((personId) => !directMemberIds.has(personId)),
    ),
  ]

  const descendantMembers = descendantMemberIds.map((personId) =>
    groupMemberSchema.parse({ userId: personId, isDirect: false, addedAt: null }),
  )

  return [...directMembers, ...descendantMembers]
}

export async function createGroupMembership(groupId: string, input: CreateMembershipInput) {
  const [group, person] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        isContainer: true,
      },
    }),
    prisma.person.findUnique({
      where: { id: input.personId },
      select: { id: true },
    }),
  ])

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  if (group.isContainer) {
    throw new GroupServiceError('Direct memberships cannot be added to container groups', 409)
  }

  if (!person) {
    throw new GroupServiceError('Person not found', 404)
  }

  const existingMembership = await prisma.personGroupMembership.findUnique({
    where: {
      personId_groupId: {
        personId: input.personId,
        groupId,
      },
    },
  })

  if (existingMembership) {
    throw new GroupServiceError('Person is already a direct member of this group', 409)
  }

  return await prisma.personGroupMembership.create({
    data: {
      personId: input.personId,
      groupId,
    },
  })
}

export async function deleteGroupMembership(groupId: string, userId: string) {
  const membership = await prisma.personGroupMembership.findUnique({
    where: { personId_groupId: { personId: userId, groupId } },
  })

  if (!membership || membership.groupId !== groupId) {
    throw new GroupServiceError('Membership not found', 404)
  }

  await prisma.personGroupMembership.delete({
    where: { id: membership.id },
  })
}

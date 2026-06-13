import { z } from 'zod'

import { prisma } from '@/db'

import { createMembershipSchema } from '@/api/models/groups.mutate'
import { assertGroupExists, getDescendantGroupIds } from './assertions'
import { GroupServiceError } from './errors'

type CreateMembershipInput = z.infer<typeof createMembershipSchema>

export async function getDirectGroupMemberships(groupId: string) {
  await assertGroupExists(groupId)

  return await prisma.personGroupMembership.findMany({
    where: { groupId },
    orderBy: {
      addedAt: 'asc',
    },
  })
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

export async function deleteGroupMembership(groupId: string, membershipId: string) {
  const membership = await prisma.personGroupMembership.findUnique({
    where: { id: membershipId },
  })

  if (!membership || membership.groupId !== groupId) {
    throw new GroupServiceError('Membership not found', 404)
  }

  await prisma.personGroupMembership.delete({
    where: { id: membershipId },
  })
}

export async function getEffectiveGroupMembers(groupId: string) {
  await assertGroupExists(groupId)

  const descendantGroupIds = await getDescendantGroupIds(groupId)
  const effectiveGroupIds = [groupId, ...descendantGroupIds]
  const memberships = await prisma.personGroupMembership.findMany({
    where: {
      groupId: {
        in: effectiveGroupIds,
      },
    },
    orderBy: [{ personId: 'asc' }, { groupId: 'asc' }],
  })

  const membersByPersonId = new Map<string, { personId: string; directGroupIds: string[] }>()

  for (const membership of memberships) {
    const existing = membersByPersonId.get(membership.personId)

    if (existing) {
      existing.directGroupIds.push(membership.groupId)
      continue
    }

    membersByPersonId.set(membership.personId, {
      personId: membership.personId,
      directGroupIds: [membership.groupId],
    })
  }

  return [...membersByPersonId.values()]
}

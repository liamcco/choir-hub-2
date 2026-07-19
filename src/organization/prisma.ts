import { prisma } from '@/db'
import type { OrganizationPersistence } from '@/organization/types'
import type { PrismaClient } from '@/prisma/generated/client'

export type OrganizationPrismaClient = Pick<
  PrismaClient,
  'group' | 'member' | 'groupMembership' | 'position' | 'positionScope' | 'positionAssignment'
>

export function createPrismaOrganizationPersistence(
  client: OrganizationPrismaClient = prisma,
): OrganizationPersistence {
  return {
    listGroups: () =>
      client.group.findMany({
        orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
      }),
    createGroup: (input) =>
      client.group.create({
        data: input,
      }),
    updateGroup: (id, input) =>
      client.group.update({
        where: { id },
        data: input,
      }),
    listMembers: () =>
      client.member.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    createMember: (input) =>
      client.member.create({
        data: input,
      }),
    updateMember: (id, input) =>
      client.member.update({
        where: { id },
        data: input,
      }),
    listGroupMemberships: (input) =>
      client.groupMembership.findMany({
        where: {
          memberId: input?.memberId,
          groupId: input?.groupId,
          ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
        },
        orderBy: [{ groupId: 'asc' }, { memberId: 'asc' }, { startsAt: 'asc' }],
      }),
    createGroupMembership: (input) =>
      client.groupMembership.create({
        data: input,
      }),
    updateGroupMembership: (id, input) =>
      client.groupMembership.update({
        where: { id },
        data: input,
      }),
    listPositions: () =>
      client.position.findMany({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    createPosition: (input) =>
      client.position.create({
        data: input,
      }),
    updatePosition: (id, input) =>
      client.position.update({
        where: { id },
        data: input,
      }),
    listPositionScopes: () =>
      client.positionScope.findMany({
        orderBy: [{ positionId: 'asc' }, { groupId: 'asc' }],
      }),
    createPositionScope: (input) =>
      client.positionScope.create({
        data: input,
      }),
    deletePositionScope: async (input) => {
      await client.positionScope.delete({
        where: {
          positionId_groupId: input,
        },
      })
    },
    listPositionAssignments: (input) =>
      client.positionAssignment.findMany({
        where: {
          positionId: input?.positionId,
          memberId: input?.memberId,
          ...(input?.at ? currentDatedPeriodWhere(input.at) : {}),
        },
        orderBy: [{ positionId: 'asc' }, { startsAt: 'asc' }],
      }),
    createPositionAssignment: (input) =>
      client.positionAssignment.create({
        data: input,
      }),
    updatePositionAssignment: (id, input) =>
      client.positionAssignment.update({
        where: { id },
        data: input,
      }),
  }
}

function currentDatedPeriodWhere(at: Date) {
  return {
    startsAt: { lte: at },
    OR: [{ endsAt: null }, { endsAt: { gt: at } }],
  }
}

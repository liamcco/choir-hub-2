import { prisma } from '@/db'

export function getUserGroupMemberships(userId: string) {
  return prisma.userGroupMembership.findMany({
    where: {
      userId,
    },
    include: {
      group: {
        include: {
          kind: true,
          parentGroup: true,
        },
      },
    },
    orderBy: [
      {
        group: {
          kind: {
            name: 'asc',
          },
        },
      },
      {
        group: {
          name: 'asc',
        },
      },
    ],
  })
}

export function getUserPositions(userId: string) {
  return prisma.position.findMany({
    where: {
      currentHolderUserId: userId,
    },
    include: {
      groups: {
        include: {
          group: {
            include: {
              kind: true,
              parentGroup: true,
            },
          },
        },
        orderBy: {
          group: {
            name: 'asc',
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

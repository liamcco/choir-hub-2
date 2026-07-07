import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { prisma } from '@/db'
import { auth } from '@/lib/auth'

import type {
  AdminDashboardData,
  AdminGroup,
  AdminGroupKind,
  AdminMemberDetailData,
  AdminPosition,
  AdminUserDetail,
  AdminUserSummary,
} from './types'

const ADMIN_ROLE = 'admin'

function hasAdminRole(role: string | null | undefined) {
  return (role ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .includes(ADMIN_ROLE)
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

export async function getAdminSessionOrRedirect() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session) {
    redirect('/login')
  }

  return {
    isAdmin: hasAdminRole(session.user.role),
    requestHeaders,
    session,
  }
}

export async function requireAdminSession() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session) {
    throw new Error('Unauthorized')
  }

  if (!hasAdminRole(session.user.role)) {
    throw new Error('Forbidden')
  }

  return { requestHeaders, session }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { session } = await requireAdminSession()

  const [users, groupKinds, groups, positions] = await Promise.all([
    getAdminUsers(),
    getAdminGroupKinds(),
    getAdminGroups(),
    getAdminPositions(),
  ])

  return {
    currentAdminId: session.user.id,
    groupKinds,
    groups,
    positions,
    users,
  }
}

export async function getAdminMemberDetailData(userId: string): Promise<AdminMemberDetailData> {
  const [dashboardData, selectedUser] = await Promise.all([getAdminDashboardData(), getAdminUserDetail(userId)])

  return {
    ...dashboardData,
    selectedUser,
  }
}

async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          positionsHeld: true,
          sessions: true,
          userGroupMemberships: true,
        },
      },
      userGroupMemberships: {
        include: {
          group: true,
        },
        orderBy: {
          group: {
            name: 'asc',
          },
        },
      },
    },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  })

  return users.map((user) => ({
    banned: user.banned ?? false,
    email: user.email,
    emailVerified: user.emailVerified,
    groupCount: user._count.userGroupMemberships,
    groupIds: user.userGroupMemberships.map((membership) => membership.groupId),
    groupNames: user.userGroupMemberships.map((membership) => membership.group.name),
    id: user.id,
    image: user.image,
    name: user.name,
    positionCount: user._count.positionsHeld,
    role: user.role ?? 'user',
    sessionCount: user._count.sessions,
    username: user.username,
  }))
}

async function getAdminGroupKinds(): Promise<AdminGroupKind[]> {
  const kinds = await prisma.groupKind.findMany({
    include: {
      _count: {
        select: {
          groups: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return kinds.map((kind) => ({
    description: kind.description,
    groupCount: kind._count.groups,
    id: kind.id,
    name: kind.name,
  }))
}

async function getAdminGroups(): Promise<AdminGroup[]> {
  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: {
          memberships: true,
          positions: true,
        },
      },
      kind: true,
      parentGroup: true,
    },
    orderBy: [{ kind: { name: 'asc' } }, { name: 'asc' }],
  })

  return groups.map((group) => ({
    description: group.description,
    id: group.id,
    isContainer: group.isContainer,
    kindId: group.kindId,
    kindName: group.kind.name,
    memberCount: group._count.memberships,
    name: group.name,
    parentGroupId: group.parentGroupId,
    parentGroupName: group.parentGroup?.name ?? null,
    positionCount: group._count.positions,
  }))
}

async function getAdminPositions(): Promise<AdminPosition[]> {
  const positions = await prisma.position.findMany({
    include: {
      currentHolder: true,
      groups: {
        include: {
          group: true,
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

  return positions.map((position) => ({
    currentHolderName: position.currentHolder?.name ?? null,
    currentHolderUserId: position.currentHolderUserId,
    description: position.description,
    groupIds: position.groups.map((entry) => entry.groupId),
    groupNames: position.groups.map((entry) => entry.group.name),
    heldSince: toIso(position.heldSince),
    id: position.id,
    name: position.name,
  }))
}

async function getAdminUserDetail(userId: string | undefined): Promise<AdminUserDetail | null> {
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    include: {
      positionsHeld: {
        include: {
          groups: {
            include: {
              group: true,
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
      },
      sessions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      userGroupMemberships: {
        include: {
          group: {
            include: {
              kind: true,
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
      },
    },
    where: {
      id: userId,
    },
  })

  if (!user) {
    return null
  }

  return {
    banExpires: toIso(user.banExpires),
    banReason: user.banReason,
    banned: user.banned ?? false,
    createdAt: user.createdAt.toISOString(),
    displayUsername: user.displayUsername,
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.id,
    image: user.image,
    memberships: user.userGroupMemberships.map((membership) => ({
      addedAt: membership.addedAt.toISOString(),
      groupId: membership.groupId,
      groupKindName: membership.group.kind.name,
      groupName: membership.group.name,
      id: membership.id,
    })),
    name: user.name,
    positions: user.positionsHeld.map((position) => ({
      groupNames: position.groups.map((entry) => entry.group.name),
      heldSince: toIso(position.heldSince),
      id: position.id,
      name: position.name,
    })),
    role: user.role ?? 'user',
    sessions: user.sessions.map((session) => ({
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      id: session.id,
      impersonatedBy: session.impersonatedBy,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })),
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    updatedAt: user.updatedAt.toISOString(),
    username: user.username,
  }
}

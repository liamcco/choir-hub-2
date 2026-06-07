import { randomBytes } from 'node:crypto'

import { createUserSchema, createUsersRequestSchema, createUsersResponseSchema, userSchema } from '@/api/models/user'
import { groupSchema } from '@/api/models/group'
import { positionSchema } from '@/api/models/position'
import { prisma } from '@/db'
import { auth } from '@/lib/auth'
import z from 'zod'
import { getDirectMemberCounts, getEffectiveMemberCounts } from '@/api/services/groups/hierarchy'
import { toGroupWithMemberCounts } from '@/api/services/groups/presenters'
import { getErrorMessage as findErrorMessage } from '@/common/errors/utils'

type User = z.infer<typeof userSchema>
type CreateUserInput = z.infer<typeof createUserSchema>
type CreateUsersInput = z.infer<typeof createUsersRequestSchema>
type CreateUsersResponse = z.infer<typeof createUsersResponseSchema>
type UserOrgGroup = z.infer<typeof groupSchema>
type UserOrgPosition = z.infer<typeof positionSchema>

export type UserOrgPlacement = {
  directGroupIds: string[]
  groups: UserOrgGroup[]
  positions: UserOrgPosition[]
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  })

  if (!user) {
    return null
  }

  return toUser(user)
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
    select: userSelect,
  })

  return users.map(toUser)
}

export async function createUsers(input: CreateUsersInput): Promise<CreateUsersResponse> {
  const result: CreateUsersResponse = {
    succeeded: [],
    skipped: [],
    failed: [],
  }

  for (const userInput of input.users) {
    const createdUser = await createUser(userInput)

    if (createdUser.status === 'succeeded') {
      result.succeeded.push(createdUser.data)
    }

    if (createdUser.status === 'skipped') {
      result.skipped.push(createdUser.data)
    }

    if (createdUser.status === 'failed') {
      result.failed.push(createdUser.data)
    }
  }

  return result
}

export async function getUserOrgPlacement(userId: string): Promise<UserOrgPlacement> {
  const [groups, memberships, positions, allMemberships] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
      include: {
        kind: true,
      },
    }),
    prisma.userGroupMembership.findMany({
      where: { userId },
      select: { groupId: true },
    }),
    prisma.position.findMany({
      where: { currentHolderUserId: userId },
      orderBy: { name: 'asc' },
      include: {
        currentHolder: {
          select: { id: true, name: true },
        },
        groups: {
          select: { groupId: true },
        },
      },
    }),
    prisma.userGroupMembership.findMany({
      select: {
        groupId: true,
        userId: true,
      },
    }),
  ])

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const directGroupIds = memberships.map((membership) => membership.groupId)
  const positionGroupIds = positions.flatMap((position) => position.groups.map((group) => group.groupId))
  const visibleGroupIds = getGroupIdsWithAncestors([...directGroupIds, ...positionGroupIds], groupsById)
  const directMemberCounts = getDirectMemberCounts(allMemberships)
  const effectiveMemberCounts = getEffectiveMemberCounts(groups, allMemberships)
  const visibleGroups = groups
    .filter((group) => visibleGroupIds.has(group.id))
    .map((group) => toGroupWithMemberCounts(group, directMemberCounts, effectiveMemberCounts))

  return {
    directGroupIds,
    groups: visibleGroups,
    positions: positions.map(toPosition),
  }
}

async function createUser(
  input: CreateUserInput,
): Promise<
  | { status: 'succeeded'; data: CreateUsersResponse['succeeded'][number] }
  | { status: 'skipped'; data: CreateUsersResponse['skipped'][number] }
  | { status: 'failed'; data: CreateUsersResponse['failed'][number] }
> {
  const email = input.email.toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return {
      status: 'skipped',
      data: {
        name: input.name,
        email,
        message: 'User already exists',
      },
    }
  }

  const createdUser = await auth.api
    .createUser({
      body: {
        email,
        password: input.password ?? generateTemporaryPassword(),
        name: input.name,
        role: input.role,
      },
    })
    .catch((error: unknown) => nullifyExistingUserError(error, input.name, email))

  if ('status' in createdUser) {
    return createdUser
  }

  try {
    return {
      status: 'succeeded',
      data: {
        id: createdUser.user.id,
        name: createdUser.user.name,
        email: createdUser.user.email,
        emailVerified: createdUser.user.emailVerified,
        role: createdUser.user.role ?? 'user',
        createdAt: createdUser.user.createdAt,
        updatedAt: createdUser.user.updatedAt,
      },
    }
  } catch (error) {
    return {
      status: 'failed',
      data: {
        name: input.name,
        email,
        message: getErrorMessage(error),
      },
    }
  }
}

function generateTemporaryPassword(): string {
  return `${randomBytes(18).toString('base64url')}aA1!`
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

function toUser(user: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string | null
  createdAt: Date
  updatedAt: Date
}): User {
  return userSchema.parse({
    ...user,
    role: user.role ?? 'user',
  })
}

function toPosition(position: {
  id: string
  name: string
  description: string | null
  currentHolder: { id: string; name: string } | null
  heldSince: Date | null
  groups: Array<{ groupId: string }>
  createdAt: Date
  updatedAt: Date
}): UserOrgPosition {
  return positionSchema.parse({
    ...position,
    groupIds: position.groups.map((group) => group.groupId),
  })
}

function getGroupIdsWithAncestors<TGroup extends { id: string; parentGroupId: string | null }>(
  groupIds: string[],
  groupsById: Map<string, TGroup>,
) {
  const result = new Set<string>()

  for (const groupId of groupIds) {
    let currentGroupId: string | null = groupId
    const visitedGroupIds = new Set<string>()

    while (currentGroupId && !visitedGroupIds.has(currentGroupId)) {
      visitedGroupIds.add(currentGroupId)
      result.add(currentGroupId)
      currentGroupId = groupsById.get(currentGroupId)?.parentGroupId ?? null
    }
  }

  return result
}

/**
 * Nullifies errors from user creation that indicate the user already exists,
 * since this can happen due to race conditions and we want to treat it as
 * a skipped create rather than a failed create, while still surface
 * other types of errors as failures with their messages.
 * @param error
 * @param name
 * @param email
 * @returns
 */
function nullifyExistingUserError(
  error: unknown,
  name: string,
  email: string,
):
  | { status: 'skipped'; data: CreateUsersResponse['skipped'][number] }
  | { status: 'failed'; data: CreateUsersResponse['failed'][number] } {
  const message = getErrorMessage(error)

  if (message.toLowerCase().includes('user already exists')) {
    return {
      status: 'skipped',
      data: {
        name,
        email,
        message: 'User already exists',
      },
    }
  }

  return {
    status: 'failed',
    data: {
      name,
      email,
      message,
    },
  }
}

function getErrorMessage(error: unknown): string {
  return findErrorMessage(error) ?? 'Could not create user'
}

import { beforeEach, describe, expect, mock, test } from 'bun:test'

type TestSession = { user: { id: string; role?: string | null } } | null

let currentSession: TestSession = null
let currentMembership: { id: string } | null = null
let currentAssignment: { id: string } | null = null
const requestHeaders = new Headers({ cookie: 'session=abc' })
const headers = mock(async () => requestHeaders)
const getSession = mock(async () => currentSession)
const userHasPermission = mock(async ({ body }: { body: { userId: string } }) => ({
  success: currentSession?.user.id === body.userId && currentSession.user.role?.split(',').includes('admin'),
}))
const findMembership = mock(async () => currentMembership)
const findAssignment = mock(async () => currentAssignment)
const authorizationDenied = mock(() => {})
const accountAccessChanged = mock(() => {})
const logger = {
  debug: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
}

mock.module('next/headers', () => ({ headers }))
mock.module('@/core/auth/auth', () => ({ auth: { api: { getSession, userHasPermission } } }))
mock.module('@/core/db', () => ({
  prisma: {
    groupMembership: { findFirst: findMembership },
    positionAssignment: { findFirst: findAssignment },
  },
}))
mock.module('@/core/logging', () => ({ audit: { authorizationDenied, accountAccessChanged }, logger }))

const {
  AuthorizationDeniedError,
  userIsAdmin,
  canCurrentUser,
  requireAdmin,
  requireCurrentUserPermission,
  canCurrentUserInGroup,
  requireCurrentUserInGroup,
  canCurrentUserHoldPosition,
  requireCurrentUserHoldsPosition,
} = await import('@/core/auth/permissions.server')

const updateGroup = { resource: 'group', action: 'update' } as const

beforeEach(() => {
  currentSession = null
  headers.mockClear()
  getSession.mockClear()
  userHasPermission.mockClear()
  currentMembership = null
  currentAssignment = null
  findMembership.mockClear()
  findAssignment.mockClear()
  authorizationDenied.mockClear()
})

describe('current-user global permissions', () => {
  test('rejects predeclared requests with choir-domain scope identifiers at compile time', () => {
    const scopedUpdateGroup = { ...updateGroup, groupId: 'group-1' } as const
    const compileTimeBoundary = () => {
      // @ts-expect-error Global permission helpers reject scoped request objects, including predeclared values.
      void canCurrentUser(scopedUpdateGroup)
      // @ts-expect-error Enforcing global permission helpers reject choir-domain scope identifiers too.
      void requireCurrentUserPermission(scopedUpdateGroup)
    }

    expect(compileTimeBoundary).toBeFunction()
  })

  test('allows an admin stored in a comma-separated role string', async () => {
    currentSession = { user: { id: 'user-admin', role: 'user,admin' } }

    await expect(canCurrentUser(updateGroup)).resolves.toBe(true)
    await expect(userIsAdmin()).resolves.toBe(true)
  })

  test('denies a plain user', async () => {
    currentSession = { user: { id: 'user-member', role: 'user' } }

    await expect(canCurrentUser(updateGroup)).resolves.toBe(false)
    await expect(userIsAdmin()).resolves.toBe(false)
  })

  test('denies an unauthenticated actor', async () => {
    await expect(canCurrentUser(updateGroup)).resolves.toBe(false)
    await expect(userIsAdmin()).resolves.toBe(false)
  })
})

describe('enforcing global permissions', () => {
  test('allows an admin to continue', async () => {
    currentSession = { user: { id: 'user-admin', role: 'admin' } }

    await expect(requireCurrentUserPermission(updateGroup)).resolves.toEqual({
      state: 'authenticated',
      userId: 'user-admin',
    })
    await expect(requireAdmin()).resolves.toEqual({ state: 'authenticated', userId: 'user-admin' })
  })

  test('throws a structured authorization denial for a plain user', async () => {
    currentSession = { user: { id: 'user-member', role: 'user' } }

    try {
      await requireCurrentUserPermission(updateGroup)
      throw new Error('Expected permission enforcement to deny the user')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationDeniedError)
      expect(error).toMatchObject({
        code: 'AUTHORIZATION_DENIED',
        context: {
          actor: { state: 'authenticated', userId: 'user-member' },
          requirement: { kind: 'permission', permission: updateGroup },
        },
      })
    }
    expect(authorizationDenied).toHaveBeenCalledTimes(1)
    expect(authorizationDenied).toHaveBeenCalledWith({
      actor: { state: 'authenticated', userId: 'user-member' },
      requirement: { kind: 'permission', permission: updateGroup },
    })
  })

  test('throws a distinguishable authorization denial for an unauthenticated actor', async () => {
    try {
      await requireAdmin()
      throw new Error('Expected admin enforcement to deny the actor')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationDeniedError)
      expect(error).toMatchObject({
        code: 'AUTHORIZATION_DENIED',
        context: {
          actor: { state: 'unauthenticated' },
          requirement: { kind: 'accessRole', role: 'admin' },
        },
      })
    }
  })
})

describe('current-actor domain predicates', () => {
  test('allows a linked Member with current Group Membership', async () => {
    currentSession = { user: { id: 'member-1', role: 'user' } }
    currentMembership = { id: 'membership-1' }

    await expect(canCurrentUserInGroup({ groupId: 'group-1' })).resolves.toBe(true)
    expect(findMembership).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ memberId: 'member-1', groupId: 'group-1' }) }),
    )
  })

  test('denies missing Member or Group Membership, including a former Member', async () => {
    currentSession = { user: { id: 'member-1', role: 'admin' } }
    await expect(canCurrentUserInGroup({ groupId: 'group-1' })).resolves.toBe(false)

    await expect(canCurrentUserInGroup({ groupId: 'group-1' })).resolves.toBe(false)
  })

  test('allows and denies current Position Assignment independently of Group Membership', async () => {
    currentSession = { user: { id: 'member-1', role: 'user' } }
    currentAssignment = { id: 'assignment-1' }

    await expect(canCurrentUserHoldPosition({ positionId: 'position-1' })).resolves.toBe(true)
    expect(findAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ memberId: 'member-1', positionId: 'position-1' }) }),
    )

    currentAssignment = null
    await expect(canCurrentUserHoldPosition({ positionId: 'position-1' })).resolves.toBe(false)
  })

  test('enforcing helpers throw structured denials without using Better Auth permissions', async () => {
    currentSession = { user: { id: 'member-1', role: 'admin' } }

    await expect(requireCurrentUserInGroup({ groupId: 'group-1' })).rejects.toMatchObject({
      context: { requirement: { kind: 'currentGroupMembership', groupId: 'group-1' } },
    })
    await expect(requireCurrentUserHoldsPosition({ positionId: 'position-1' })).rejects.toMatchObject({
      context: { requirement: { kind: 'currentPositionAssignment', positionId: 'position-1' } },
    })
    expect(userHasPermission).not.toHaveBeenCalled()
  })
})

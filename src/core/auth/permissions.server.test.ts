import { beforeEach, describe, expect, mock, test } from 'bun:test'

type TestSession = { user: { id: string; role?: string | null } } | null

let currentSession: TestSession = null
const requestHeaders = new Headers({ cookie: 'session=abc' })
const headers = mock(async () => requestHeaders)
const getSession = mock(async () => currentSession)

mock.module('next/headers', () => ({ headers }))
mock.module('@/core/auth/auth', () => ({ auth: { api: { getSession } } }))

const { AuthorizationDeniedError, userIsAdmin, canCurrentUser, requireAdmin, requireCurrentUserPermission } =
  await import('@/core/auth/permissions.server')

const updateGroup = { resource: 'group', action: 'update' } as const

beforeEach(() => {
  currentSession = null
  headers.mockClear()
  getSession.mockClear()
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

    await expect(requireCurrentUserPermission(updateGroup)).resolves.toBeUndefined()
    await expect(requireAdmin()).resolves.toBeUndefined()
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

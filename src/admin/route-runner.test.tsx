import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { AccessActor } from '@/admin/access-policy'

const redirect = mock((location: string): never => {
  throw new TestRedirect(location)
})
const useRouter = mock(() => ({
  push: mock(() => {}),
}))
const getCurrentAccessActor = mock(async (): Promise<AccessActor | null> => actor)
const requireAdminSurfaceActor = mock(async (): Promise<AccessActor> => {
  if (!actor) {
    throw new Error('Unauthorized')
  }
  return actor
})
const listManagedMembers = mock(async () => [])
let actor: AccessActor | null = { id: 'admin-user', role: 'admin' }

mock.module('next/navigation', () => ({
  redirect,
  useRouter,
}))

mock.module('@/admin/actor', () => ({
  getCurrentAccessActor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/member-management/runtime', () => ({
  getMemberManagementService: async () => ({
    listManagedMembers,
  }),
}))

mock.module('@/admin/member-management/screen', () => ({
  MemberManagementScreen: ({ accounts }: { accounts: unknown[] }) => <main>{accounts.length} managed accounts</main>,
}))

const { renderAdminRoute } = await import('@/admin/route-runner')
const { default: AdminMembersPage } = await import('@/app/(app)/admin/members/page')

beforeEach(() => {
  actor = { id: 'admin-user', role: 'admin' }
  redirect.mockClear()
  useRouter.mockClear()
  getCurrentAccessActor.mockClear()
  requireAdminSurfaceActor.mockClear()
  listManagedMembers.mockClear()
})

describe('admin route runner', () => {
  test('renders route output for actors that can access the admin surface', async () => {
    const load = mock(async (currentActor: AccessActor) => ({ actorId: currentActor.id, count: 2 }))

    const output = await renderAdminRoute({
      surface: 'organization-admin',
      load,
      render: (state) => (
        <main>
          Loaded {state.count} admin records for {state.actorId}
        </main>
      ),
      isAuthorizationError: () => false,
    })

    expect(renderToStaticMarkup(output)).toContain('Loaded 2 admin records for admin-user')
    expect(load).toHaveBeenCalledWith({ id: 'admin-user', role: 'admin' })
    expect(redirect).not.toHaveBeenCalled()
  })

  test('redirects unauthenticated actors before loading route state', async () => {
    actor = null
    const load = mock(async () => ({ count: 2 }))

    await expect(
      renderAdminRoute({
        surface: 'organization-admin',
        load,
        render: (state) => <main>Loaded {state.count}</main>,
        isAuthorizationError: () => false,
      }),
    ).rejects.toEqual(new TestRedirect('/login'))

    expect(load).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  test('redirects non-admin actors before loading route state', async () => {
    actor = { id: 'member-user', role: 'user' }
    const load = mock(async () => ({ count: 2 }))

    await expect(
      renderAdminRoute({
        surface: 'members',
        load,
        render: (state) => <main>Loaded {state.count}</main>,
        isAuthorizationError: () => false,
      }),
    ).rejects.toEqual(new TestRedirect('/organization'))

    expect(load).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/organization')
  })

  test('maps workflow authorization errors to the organization route', async () => {
    const authorizationError = new Error('Only admins can manage Groups.')

    await expect(
      renderAdminRoute({
        surface: 'organization-admin',
        load: async () => {
          throw authorizationError
        },
        render: (state: { count: number }) => <main>Loaded {state.count}</main>,
        isAuthorizationError: (error) => error === authorizationError,
      }),
    ).rejects.toEqual(new TestRedirect('/organization'))

    expect(redirect).toHaveBeenCalledWith('/organization')
  })

  test('members page adapter loads Member management state through the route runner', async () => {
    const output = await AdminMembersPage()

    expect(renderToStaticMarkup(output)).toContain('0 managed accounts')
    expect(listManagedMembers).toHaveBeenCalledWith({ id: 'admin-user', role: 'admin' })
  })
})

class TestRedirect extends Error {
  constructor(readonly location: string) {
    super(`Redirected to ${location}`)
    this.name = 'TestRedirect'
  }
}

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { getRouteAccessDecision, getRouteAccessPolicy } from '@/core/auth/route-access'
import { AppNavigationTemplate, getNavigationItems } from '@/core/navigation/app-navigation'
import { ROUTES } from '@/core/navigation/site'

describe('app navigation', () => {
  test('classifies login as public and every other route as authenticated', () => {
    expect(getRouteAccessPolicy(ROUTES.login)).toEqual({ kind: 'public' })
    expect(getRouteAccessPolicy(ROUTES.account)).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/')).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy(ROUTES.adminMembers)).toEqual({ kind: 'admin' })
    expect(getRouteAccessPolicy('/admin/future')).toEqual({ kind: 'admin' })
  })

  test('decides route access from authentication only', async () => {
    expect(await getRouteAccessDecision('/admin/members', null)).toEqual({ kind: 'redirect', location: '/login' })
    expect(await getRouteAccessDecision('/account', null)).toEqual({ kind: 'redirect', location: '/login' })
    expect(await getRouteAccessDecision('/login', null)).toEqual({ kind: 'allow' })
    expect(await getRouteAccessDecision('/admin/members', { user: { id: 'member', role: 'user' } })).toEqual({
      kind: 'forbidden',
    })
    expect(await getRouteAccessDecision('/admin/members', { user: { id: 'admin', role: 'admin' } })).toEqual({
      kind: 'allow',
    })
    expect(await getRouteAccessDecision('/organization', { user: { id: 'member', role: 'user' } })).toEqual({
      kind: 'allow',
    })
  })

  test('shows all v1 app navigation to authenticated users', () => {
    const items = getNavigationItems({ showAdmin: true })
    const markup = renderToStaticMarkup(<AppNavigationTemplate config={{ showAdmin: true }} />)

    expect(items.map((item) => item.href)).toEqual([
      '/organization',
      '/account',
      '/admin/members',
      '/admin/groups',
      '/admin/group-memberships',
      '/admin/positions',
      '/admin/position-assignments',
    ])
    expect(markup).toContain('Members')
    expect(markup).toContain('Groups')
    expect(markup).toContain('Group Memberships')
    expect(markup).toContain('Positions')
    expect(markup).toContain('Position Assignments')
  })

  test('shows only login navigation to anonymous visitors', () => {
    const markup = renderToStaticMarkup(<AppNavigationTemplate config={null} />)

    expect(getNavigationItems(null).map((item) => item.href)).toEqual(['/login'])
    expect(markup).toContain('Login')
    expect(markup).not.toContain('Organization')
    expect(markup).not.toContain('/admin/')
  })

  test('hides admin navigation from authenticated non-admins', () => {
    const items = getNavigationItems({ showAdmin: false })
    expect(items.map((item) => item.href)).toEqual(['/organization', '/account'])
  })
})

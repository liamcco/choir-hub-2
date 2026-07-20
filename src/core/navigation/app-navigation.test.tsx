import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppNavigationTemplate, getNavigationItems } from '@/core/navigation/app-navigation'
import { getPostLoginPath, getRouteAccessDecision, getRouteAccessPolicy, ROUTES } from '@/core/navigation/app-routes'

describe('app navigation', () => {
  test('classifies login as public and every other route as authenticated', () => {
    expect(getRouteAccessPolicy(ROUTES.login)).toEqual({ kind: 'public' })
    expect(getRouteAccessPolicy(ROUTES.account)).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/')).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy(ROUTES.adminMembers)).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/admin/future')).toEqual({ kind: 'authenticated' })
  })

  test('decides route access from authentication only', () => {
    expect(getRouteAccessDecision('/admin/members', false)).toEqual({ kind: 'redirect', location: '/login' })
    expect(getRouteAccessDecision('/account', false)).toEqual({ kind: 'redirect', location: '/login' })
    expect(getRouteAccessDecision('/login', false)).toEqual({ kind: 'allow' })
    expect(getRouteAccessDecision('/admin/members', true)).toEqual({ kind: 'allow' })
    expect(getRouteAccessDecision('/organization', true)).toEqual({ kind: 'allow' })
  })

  test('uses the organization route after sign-in', () => {
    expect(getPostLoginPath()).toBe(ROUTES.organization)
  })

  test('shows all v1 app navigation to authenticated users', () => {
    const items = getNavigationItems(true)
    const markup = renderToStaticMarkup(<AppNavigationTemplate isAuthenticated={true} />)

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
    const markup = renderToStaticMarkup(<AppNavigationTemplate isAuthenticated={false} />)

    expect(getNavigationItems(false).map((item) => item.href)).toEqual(['/login'])
    expect(markup).toContain('Login')
    expect(markup).not.toContain('Organization')
    expect(markup).not.toContain('/admin/')
  })
})

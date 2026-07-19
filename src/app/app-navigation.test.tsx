import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppNavigation, getNavigationItems } from '@/app/app-navigation'

describe('app navigation', () => {
  test('shows organizational read-only navigation to non-admin Users without admin management links', () => {
    const items = getNavigationItems({ id: 'user-member', role: 'user' })
    const markup = renderToStaticMarkup(<AppNavigation actor={{ id: 'user-member', role: 'user' }} />)

    expect(items.map((item) => item.href)).toEqual(['/organization', '/account'])
    expect(markup).toContain('Organization')
    expect(markup).toContain('Account')
    expect(markup).not.toContain('Members')
    expect(markup).not.toContain('/admin/')
  })

  test('shows admin management navigation only to admins', () => {
    const items = getNavigationItems({ id: 'user-admin', role: 'admin' })
    const markup = renderToStaticMarkup(<AppNavigation actor={{ id: 'user-admin', role: 'admin' }} />)

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
    const markup = renderToStaticMarkup(<AppNavigation actor={null} />)

    expect(getNavigationItems(null).map((item) => item.href)).toEqual(['/login'])
    expect(markup).toContain('Login')
    expect(markup).not.toContain('Organization')
    expect(markup).not.toContain('/admin/')
  })
})

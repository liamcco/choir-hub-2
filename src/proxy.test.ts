import { describe, expect, test } from 'bun:test'
import { evaluateProxyRouteAccess } from '@/proxy'

describe('proxy route protection', () => {
  test('redirects unauthenticated app requests to login', () => {
    expect(evaluateProxyRouteAccess('/admin/members', false)).toEqual({ kind: 'redirect', location: '/login' })
    expect(evaluateProxyRouteAccess('/organization', false)).toEqual({ kind: 'redirect', location: '/login' })
    expect(evaluateProxyRouteAccess('/account', false)).toEqual({ kind: 'redirect', location: '/login' })
  })

  test('allows public login requests without authentication', () => {
    expect(evaluateProxyRouteAccess('/login', false)).toEqual({ kind: 'allow' })
  })

  test('allows authenticated users on every v1 app route', () => {
    for (const path of [
      '/organization',
      '/account',
      '/admin/members',
      '/admin/groups',
      '/admin/group-memberships',
      '/admin/positions',
      '/admin/position-assignments',
    ]) {
      expect(evaluateProxyRouteAccess(path, true)).toEqual({ kind: 'allow' })
    }
  })
})

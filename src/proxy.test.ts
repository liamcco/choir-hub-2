import { describe, expect, test } from 'bun:test'
import { evaluateProxyRouteAccess } from '@/proxy'

describe('proxy route protection', () => {
  test('redirects unauthenticated admin requests to login', () => {
    expect(evaluateProxyRouteAccess('/admin/members', null)).toEqual({ kind: 'redirect', location: '/login' })
  })

  test('denies cached non-admin actors on admin routes', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'user-member', role: 'user' })).toEqual({
      kind: 'redirect',
      location: '/organization',
    })
  })

  test('denies authenticated actors whose cached role cannot prove admin access', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'unknown-role' })).toEqual({
      kind: 'redirect',
      location: '/organization',
    })
  })

  test('allows cached admin actors on admin routes', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'user-admin', role: 'admin' })).toEqual({ kind: 'allow' })
  })

  test('protects every v1 admin organizational management route for non-admins', () => {
    for (const path of [
      '/admin/members',
      '/admin/groups',
      '/admin/group-memberships',
      '/admin/positions',
      '/admin/position-assignments',
    ]) {
      expect(evaluateProxyRouteAccess(path, { id: 'user-member', role: 'user' })).toEqual({
        kind: 'redirect',
        location: '/organization',
      })
    }
  })

  test('allows non-admin Users on authenticated non-admin routes', () => {
    expect(evaluateProxyRouteAccess('/organization', { id: 'user-member', role: 'user' })).toEqual({ kind: 'allow' })
    expect(evaluateProxyRouteAccess('/account', { id: 'user-member', role: 'user' })).toEqual({ kind: 'allow' })
  })
})

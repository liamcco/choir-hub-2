import { describe, expect, test } from 'bun:test'
import { evaluateProxyRouteAccess } from '@/proxy'

describe('proxy route protection', () => {
  test('redirects unauthenticated admin requests to login', () => {
    expect(evaluateProxyRouteAccess('/admin/members', null)).toEqual({ kind: 'redirect', location: '/login' })
  })

  test('denies cached non-admin actors on admin routes', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'user-member', role: 'user' })).toEqual({
      kind: 'redirect',
      location: '/',
    })
  })

  test('denies authenticated actors whose cached role cannot prove admin access', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'unknown-role' })).toEqual({
      kind: 'redirect',
      location: '/',
    })
  })

  test('allows cached admin actors on admin routes', () => {
    expect(evaluateProxyRouteAccess('/admin/members', { id: 'user-admin', role: 'admin' })).toEqual({ kind: 'allow' })
  })
})

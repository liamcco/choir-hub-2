import { describe, expect, test } from 'bun:test'
import {
  canAccessAdminSurface,
  canManageMembers,
  getAdminSurfaceAccessDecision,
  getPostLoginPath,
  getRouteAccessDecision,
  getRouteAccessPolicy,
  parseActorRoles,
} from '@/admin/access-policy'

describe('admin access policy', () => {
  test('parses Better Auth role values in one place', () => {
    expect(parseActorRoles('admin,user')).toEqual(['admin', 'user'])
    expect(parseActorRoles([' admin ', 'user,committee'])).toEqual(['admin', 'user', 'committee'])
    expect(parseActorRoles(null)).toEqual([])
  })

  test('allows only admin actors to manage Members and admin surfaces', () => {
    expect(canManageMembers({ id: 'user-admin', role: 'user,admin' })).toBe(true)
    expect(canAccessAdminSurface({ id: 'user-admin', role: ['admin'] })).toBe(true)

    expect(canManageMembers({ id: 'user-member', role: 'user' })).toBe(false)
    expect(canAccessAdminSurface(null)).toBe(false)
  })

  test('classifies public, authenticated, and admin routes with policy vocabulary', () => {
    expect(getRouteAccessPolicy('/login')).toEqual({ kind: 'public' })
    expect(getRouteAccessPolicy('/account')).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/')).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/admin/members')).toEqual({ kind: 'admin', surface: 'members' })
    expect(getRouteAccessPolicy('/admin/future')).toEqual({ kind: 'admin', surface: 'organization-admin' })
  })

  test('decides route access for unauthenticated and admin actors', () => {
    expect(getRouteAccessDecision('/admin/members', null)).toEqual({ kind: 'redirect', location: '/login' })
    expect(getRouteAccessDecision('/admin/members', { id: 'user-member', role: 'user' })).toEqual({
      kind: 'redirect',
      location: '/organization',
    })
    expect(getRouteAccessDecision('/admin/members', { id: 'unknown-role' })).toEqual({
      kind: 'redirect',
      location: '/organization',
    })
    expect(getRouteAccessDecision('/account', null)).toEqual({ kind: 'redirect', location: '/login' })
    expect(getRouteAccessDecision('/account', { id: 'user-member', role: 'user' })).toEqual({ kind: 'allow' })
    expect(getRouteAccessDecision('/organization', { id: 'user-member', role: 'user' })).toEqual({ kind: 'allow' })
    expect(getRouteAccessDecision('/admin/members', { id: 'user-admin', role: 'admin' })).toEqual({ kind: 'allow' })
  })

  test('decides admin surface access for pages and actions', () => {
    expect(getAdminSurfaceAccessDecision(null, 'members')).toEqual({ kind: 'redirect', location: '/login' })
    expect(getAdminSurfaceAccessDecision({ id: 'user-member', role: 'user' }, 'members')).toEqual({
      kind: 'redirect',
      location: '/organization',
    })
    expect(getAdminSurfaceAccessDecision({ id: 'user-admin', role: 'admin' }, 'members')).toEqual({ kind: 'allow' })
  })

  test('uses the policy destination after sign-in', () => {
    expect(getPostLoginPath()).toBe('/organization')
    expect(getPostLoginPath({ id: 'user-member', role: 'user' })).toBe('/organization')
    expect(getPostLoginPath({ id: 'user-admin', role: 'admin' })).toBe('/admin/members')
  })
})

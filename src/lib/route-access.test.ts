import { describe, expect, test } from 'bun:test'
import {
  canAccessAdminSurface,
  canManageMembers,
  getAccessibleNavigationRoutes,
  getAdminSurfaceAccessDecision,
  getPostLoginPath,
  getRouteAccessDecision,
  getRouteAccessPolicy,
  parseActorRoles,
  ROUTES,
} from '@/lib/route-access'

describe('route access policy', () => {
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
    expect(getRouteAccessPolicy(ROUTES.login)).toEqual({ kind: 'public' })
    expect(getRouteAccessPolicy(ROUTES.account)).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy('/')).toEqual({ kind: 'authenticated' })
    expect(getRouteAccessPolicy(ROUTES.adminMembers)).toEqual({ kind: 'admin', surface: 'members' })
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
    expect(getPostLoginPath()).toBe(ROUTES.organization)
    expect(getPostLoginPath({ id: 'user-member', role: 'user' })).toBe(ROUTES.organization)
    expect(getPostLoginPath({ id: 'user-admin', role: 'admin' })).toBe(ROUTES.adminMembers)
  })

  test('selects visible navigation routes from the same policy vocabulary', () => {
    expect(getAccessibleNavigationRoutes(null).map((route) => route.id)).toEqual(['login'])
    expect(getAccessibleNavigationRoutes({ id: 'user-member', role: 'user' }).map((route) => route.id)).toEqual([
      'organization',
      'account',
    ])
    expect(getAccessibleNavigationRoutes({ id: 'user-admin', role: 'admin' }).map((route) => route.id)).toEqual([
      'organization',
      'account',
      'adminMembers',
      'adminGroups',
      'adminGroupMemberships',
      'adminPositions',
      'adminPositionAssignments',
    ])

    expect(getAccessibleNavigationRoutes({ id: 'user-admin', role: 'admin' }).map((route) => route.href)).toEqual([
      ROUTES.organization,
      ROUTES.account,
      ROUTES.adminMembers,
      ROUTES.adminGroups,
      ROUTES.adminGroupMemberships,
      ROUTES.adminPositions,
      ROUTES.adminPositionAssignments,
    ])
  })
})

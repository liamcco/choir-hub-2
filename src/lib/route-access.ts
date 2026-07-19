import type { AccessActor } from '@/lib/access-actor'

export type AdminSurface = 'members' | 'organization-admin'

export const ROUTES = {
  login: '/login',
  organization: '/organization',
  account: '/account',
  adminRoot: '/admin',
  adminMembers: '/admin/members',
  adminGroups: '/admin/groups',
  adminGroupMemberships: '/admin/group-memberships',
  adminPositions: '/admin/positions',
  adminPositionAssignments: '/admin/position-assignments',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<RouteId, 'adminRoot'>

export type RouteAccessPolicy =
  | { kind: 'public' }
  | { kind: 'authenticated' }
  | { kind: 'admin'; surface: AdminSurface }

export type AccessDecision = { kind: 'allow' } | { kind: 'redirect'; location: string }

export type AccessibleNavigationRoute = {
  id: NavigationRouteId
  href: (typeof ROUTES)[NavigationRouteId]
  section: 'member' | 'admin'
}

const ADMIN_ROLE = 'admin'
const PUBLIC_PATHS = new Set<string>([ROUTES.login])
const MEMBER_NAVIGATION_ROUTES = [
  { id: 'organization', href: ROUTES.organization, section: 'member' },
  { id: 'account', href: ROUTES.account, section: 'member' },
] as const satisfies readonly AccessibleNavigationRoute[]
const ADMIN_NAVIGATION_ROUTES = [
  { id: 'adminMembers', href: ROUTES.adminMembers, section: 'admin' },
  { id: 'adminGroups', href: ROUTES.adminGroups, section: 'admin' },
  { id: 'adminGroupMemberships', href: ROUTES.adminGroupMemberships, section: 'admin' },
  { id: 'adminPositions', href: ROUTES.adminPositions, section: 'admin' },
  { id: 'adminPositionAssignments', href: ROUTES.adminPositionAssignments, section: 'admin' },
] as const satisfies readonly AccessibleNavigationRoute[]
const LOGIN_NAVIGATION_ROUTE = {
  id: 'login',
  href: ROUTES.login,
  section: 'member',
} as const satisfies AccessibleNavigationRoute

export function parseActorRoles(role: AccessActor['role']): string[] {
  const values = Array.isArray(role) ? role : [role]

  return values
    .flatMap((value) => value?.split(',') ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
}

export function canManageMembers(actor: AccessActor | null | undefined) {
  return actorHasRole(actor, ADMIN_ROLE)
}

export function canAccessAdminSurface(actor: AccessActor | null | undefined) {
  return actorHasRole(actor, ADMIN_ROLE)
}

export function getRouteAccessPolicy(path: string): RouteAccessPolicy {
  if (PUBLIC_PATHS.has(path)) {
    return { kind: 'public' }
  }

  if (isAdminPath(path)) {
    return {
      kind: 'admin',
      surface:
        path === ROUTES.adminMembers || path.startsWith(`${ROUTES.adminMembers}/`) ? 'members' : 'organization-admin',
    }
  }

  return { kind: 'authenticated' }
}

export function getRouteAccessDecision(path: string, actor: AccessActor | null | undefined): AccessDecision {
  const routePolicy = getRouteAccessPolicy(path)

  if (routePolicy.kind === 'public') {
    return { kind: 'allow' }
  }

  if (!actor) {
    return { kind: 'redirect', location: ROUTES.login }
  }

  if (routePolicy.kind === 'admin') {
    return getAdminSurfaceAccessDecision(actor, routePolicy.surface)
  }

  return { kind: 'allow' }
}

export function getAdminSurfaceAccessDecision(
  actor: AccessActor | null | undefined,
  surface: AdminSurface,
): AccessDecision {
  if (!actor) {
    return { kind: 'redirect', location: ROUTES.login }
  }

  return canAccessAdminSurfaceByKind(actor, surface)
    ? { kind: 'allow' }
    : { kind: 'redirect', location: ROUTES.organization }
}

export function getPostLoginPath(actor?: AccessActor | null) {
  return actor && canManageMembers(actor) ? ROUTES.adminMembers : ROUTES.organization
}

export function getAccessibleNavigationRoutes(actor: AccessActor | null | undefined): AccessibleNavigationRoute[] {
  if (!actor) {
    return [LOGIN_NAVIGATION_ROUTE]
  }

  return canAccessAdminSurface(actor)
    ? [...MEMBER_NAVIGATION_ROUTES, ...ADMIN_NAVIGATION_ROUTES]
    : [...MEMBER_NAVIGATION_ROUTES]
}

function actorHasRole(actor: AccessActor | null | undefined, role: string) {
  return parseActorRoles(actor?.role).includes(role)
}

function canAccessAdminSurfaceByKind(actor: AccessActor, surface: AdminSurface) {
  return surface === 'members' ? canManageMembers(actor) : canAccessAdminSurface(actor)
}

function isAdminPath(path: string) {
  return path === ROUTES.adminRoot || path.startsWith(`${ROUTES.adminRoot}/`)
}

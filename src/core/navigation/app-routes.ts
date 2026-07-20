export const ROUTES = {
  home: '/',
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
export type NavigationRouteId = Exclude<RouteId, 'adminRoot' | 'home'>
export type RouteAccessPolicy = { kind: 'public' } | { kind: 'authenticated' }
export type AccessDecision = { kind: 'allow' } | { kind: 'redirect'; location: string }

const PUBLIC_PATHS = new Set<string>([ROUTES.login])

export function getRouteAccessPolicy(path: string): RouteAccessPolicy {
  return PUBLIC_PATHS.has(path) ? { kind: 'public' } : { kind: 'authenticated' }
}

export function getRouteAccessDecision(path: string, isAuthenticated: boolean): AccessDecision {
  const routePolicy = getRouteAccessPolicy(path)
  return routePolicy.kind === 'public' || isAuthenticated
    ? { kind: 'allow' }
    : { kind: 'redirect', location: ROUTES.login }
}

export function getPostLoginPath() {
  return ROUTES.organization
}

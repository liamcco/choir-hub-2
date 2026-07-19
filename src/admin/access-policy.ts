export type AccessActor = {
  id: string
  role?: string | string[] | null
}

export type AdminSurface = 'members' | 'organization-admin'

export type RouteAccessPolicy =
  | { kind: 'public' }
  | { kind: 'authenticated' }
  | { kind: 'admin'; surface: AdminSurface }

export type AccessDecision = { kind: 'allow' } | { kind: 'redirect'; location: string }

const ADMIN_ROLE = 'admin'
const ADMIN_MEMBER_PATH = '/admin/members'
const ADMIN_ROUTE_PREFIX = '/admin'
const ORGANIZATION_PATH = '/organization'
const PUBLIC_PATHS = new Set(['/login'])

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
        path === ADMIN_MEMBER_PATH || path.startsWith(`${ADMIN_MEMBER_PATH}/`) ? 'members' : 'organization-admin',
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
    return { kind: 'redirect', location: '/login' }
  }

  if (routePolicy.kind === 'admin') {
    return getAdminSurfaceAccessDecision(actor, routePolicy.surface)
  }

  return { kind: 'allow' }
}

export function getAdminSurfaceAccessDecision(
  actor: AccessActor | null | undefined,
  _surface: AdminSurface,
): AccessDecision {
  if (!actor) {
    return { kind: 'redirect', location: '/login' }
  }

  return canAccessAdminSurface(actor) ? { kind: 'allow' } : { kind: 'redirect', location: ORGANIZATION_PATH }
}

export function getPostLoginPath(actor?: AccessActor | null) {
  return actor && canManageMembers(actor) ? ADMIN_MEMBER_PATH : ORGANIZATION_PATH
}

function actorHasRole(actor: AccessActor | null | undefined, role: string) {
  return parseActorRoles(actor?.role).includes(role)
}

function isAdminPath(path: string) {
  return path === ADMIN_ROUTE_PREFIX || path.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
}

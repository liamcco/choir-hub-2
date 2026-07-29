import { requireAdmin } from '@/core/auth/permissions.server'
import { getPostLoginPath, loginPath, ROUTES } from '@/core/navigation/site'

export type RouteAccessPolicy = { kind: 'public' } | { kind: 'authenticated' } | { kind: 'admin' }
export type AccessDecision = { kind: 'allow' } | { kind: 'redirect'; location: string } | { kind: 'forbidden' }
export type RouteSession = { user: { id: string; role?: string | null } }

const PUBLIC_PATHS = new Set<string>([ROUTES.login, ROUTES.forgotPassword, ROUTES.resetPassword])

export function getRouteAccessPolicy(path: string): RouteAccessPolicy {
  if (PUBLIC_PATHS.has(path)) return { kind: 'public' }
  return path === ROUTES.adminRoot || path.startsWith(`${ROUTES.adminRoot}/`)
    ? { kind: 'admin' }
    : { kind: 'authenticated' }
}

export async function getRouteAccessDecision(
  path: string,
  session: RouteSession | null,
  requestedPath = path,
): Promise<AccessDecision> {
  const policy = getRouteAccessPolicy(path)

  if (path === ROUTES.login && session) return { kind: 'redirect', location: getPostLoginPath(session.user.role) }
  if (policy.kind === 'public') return { kind: 'allow' }

  if (!session) return { kind: 'redirect', location: loginPath(requestedPath) }

  if (policy.kind === 'admin') {
    try {
      await requireAdmin(session)
    } catch {
      return { kind: 'forbidden' }
    }
  }
  return { kind: 'allow' }
}

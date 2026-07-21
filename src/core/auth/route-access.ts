import { requireAdmin } from '@/core/auth/permissions.server'
import { ROUTES } from '@/core/navigation/site'

export type RouteAccessPolicy = { kind: 'public' } | { kind: 'authenticated' } | { kind: 'admin' }
export type AccessDecision = { kind: 'allow' } | { kind: 'redirect'; location: string } | { kind: 'forbidden' }
export type RouteSession = { user: { id: string; role?: string | null } }

const PUBLIC_PATHS = new Set<string>([ROUTES.login])

export function getRouteAccessPolicy(path: string): RouteAccessPolicy {
  if (PUBLIC_PATHS.has(path)) return { kind: 'public' }
  return path === ROUTES.adminRoot || path.startsWith(`${ROUTES.adminRoot}/`)
    ? { kind: 'admin' }
    : { kind: 'authenticated' }
}

export async function getRouteAccessDecision(path: string, session: RouteSession | null): Promise<AccessDecision> {
  const policy = getRouteAccessPolicy(path)

  if (policy.kind === 'public') return { kind: 'allow' }

  if (!session) return { kind: 'redirect', location: ROUTES.login }

  if (policy.kind === 'admin') {
    try {
      await requireAdmin(session)
    } catch {
      return { kind: 'forbidden' }
    }
  }
  return { kind: 'allow' }
}

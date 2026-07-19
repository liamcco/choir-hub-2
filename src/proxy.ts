import { getSessionCookie } from 'better-auth/cookies'
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { type AccessActor, type AccessDecision, getRouteAccessDecision } from '@/admin/access-policy'
import { auth } from './lib/auth'

type ProxyRouteDecision = AccessDecision

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const actor = await getCachedActor(req)
  const decision = evaluateProxyRouteAccess(path, actor)

  if (decision.kind === 'redirect') {
    const url = req.nextUrl.clone()
    url.pathname = decision.location
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export function evaluateProxyRouteAccess(path: string, actor: AccessActor | null): ProxyRouteDecision {
  return getRouteAccessDecision(path, actor)
}

async function getCachedActor(req: NextRequest): Promise<AccessActor | null> {
  if (!getSessionCookie(req)) {
    return null
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const user = session && typeof session === 'object' && 'user' in session ? session.user : null

  if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string') {
    return { id: 'authenticated-session' }
  }

  return {
    id: user.id,
    role: 'role' in user && (typeof user.role === 'string' || Array.isArray(user.role)) ? user.role : null,
  }
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

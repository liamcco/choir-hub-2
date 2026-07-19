import { getSessionCookie } from 'better-auth/cookies'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { type AccessDecision, getRouteAccessDecision } from '@/navigation/app-routes'

type ProxyRouteDecision = AccessDecision

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const decision = evaluateProxyRouteAccess(path, hasCachedSession(req))

  if (decision.kind === 'redirect') {
    const url = req.nextUrl.clone()
    url.pathname = decision.location
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export function evaluateProxyRouteAccess(path: string, isAuthenticated: boolean): ProxyRouteDecision {
  return getRouteAccessDecision(path, isAuthenticated)
}

function hasCachedSession(req: NextRequest): boolean {
  return Boolean(getSessionCookie(req))
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

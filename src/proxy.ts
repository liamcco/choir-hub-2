import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/core/auth/auth'
import { getRouteAccessDecision } from '@/core/auth/route-access'

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const requestedPath = `${path}${req.nextUrl.search}`
  if ((await getRouteAccessDecision(path, null, requestedPath)).kind === 'allow') return NextResponse.next()

  const session = await auth.api.getSession({ headers: req.headers })
  const decision = await getRouteAccessDecision(path, session, requestedPath)

  if (decision.kind === 'redirect') {
    const redirectUrl = new URL(decision.location, req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (decision.kind === 'forbidden') return new NextResponse(null, { status: 403 })

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

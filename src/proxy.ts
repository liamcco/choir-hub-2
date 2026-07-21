import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/core/auth/auth'
import { getRouteAccessDecision } from '@/core/auth/route-access'

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if ((await getRouteAccessDecision(path, null)).kind === 'allow') return NextResponse.next()

  const session = await auth.api.getSession({ headers: req.headers })
  const decision = await getRouteAccessDecision(path, session)

  if (decision.kind === 'redirect') {
    const url = req.nextUrl.clone()
    url.pathname = decision.location
    return NextResponse.redirect(url)
  }

  if (decision.kind === 'forbidden') return new NextResponse(null, { status: 403 })

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

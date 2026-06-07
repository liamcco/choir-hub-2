// biome-ignore-all lint: Will come back to this later
import { getSessionCookie } from 'better-auth/cookies'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const publicRoutes = new Set(['/login'])
const adminRoutePrefixes = ['/admin']

export default async function proxy(req: NextRequest) {
  // TODO: Wait until we have proper auth to fix this
  return NextResponse.next()

  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.has(path)
  const isAdminRoute = adminRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(req)

  if (!sessionCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAdminRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

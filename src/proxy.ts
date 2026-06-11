import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionCookie } from 'better-auth/cookies'
import { headers } from 'next/headers'

const publicRoutes = new Set(['/login', '/forgot'])
const protectedRoutes = new Set(['/admin'])

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.has(path)
  const isProtectedRoute = protectedRoutes.has(path)

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(req)

  if (!sessionCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionCookie } from 'better-auth/cookies'

const publicRoutes = new Set(['/login', '/forgot'])
const adminRoutePrefixes = ['/admin']

export default async function proxy(req: NextRequest) {
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
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session || session.user.role !== 'admin') {
      const url = req.nextUrl.clone()
      url.pathname = session ? '/' : '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

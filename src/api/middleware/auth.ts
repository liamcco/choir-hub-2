import type { MiddlewareHandler } from 'hono'

import type { ApiEnv } from '@/api/context'
import { auth } from '@/lib/auth'

export const attachSession: MiddlewareHandler<ApiEnv> = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  c.set('user', session?.user ?? null)
  c.set('session', session?.session ?? null)

  await next()
}

export const requireAuth: MiddlewareHandler<ApiEnv> = async (c, next) => {
  if (!c.get('user')) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  await next()
}

export const requireAdmin: MiddlewareHandler<ApiEnv> = async (c, next) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403)
  }

  await next()
}

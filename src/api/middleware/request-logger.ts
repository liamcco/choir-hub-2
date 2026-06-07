import type { MiddlewareHandler } from 'hono'
import { logger } from 'hono/logger'

const honoLogger = logger()

export const requestLogger: MiddlewareHandler = (c, next) => {
  if (c.req.path.startsWith('/api/studio')) {
    return next()
  }

  return honoLogger(c, next)
}

import type { Context } from 'hono'
import { Hono } from 'hono'

import { auth } from '@/lib/auth'

import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { betterAuthStudio } from 'better-auth-studio/hono'
import { openAPIRouteHandler } from 'hono-openapi'

import type { ApiEnv } from '@/api/context'
import { openApiOptions } from '@/api/docs/openapi'
import { handleApiError } from '@/api/errors'
import { attachSession, requireAuth } from '@/api/middleware/auth'
import { requestLogger } from '@/api/middleware/request-logger'
import routes from '@/api/routes'
import studioConfig from '@/lib/studio.config'

const app = new Hono<ApiEnv>().basePath('/api')

app.use('*', requestLogger)
app.use('*', attachSession)

// better-auth API routes (e.g., /auth/login, /auth/logout, /auth/session)
app.on(['POST', 'GET'], '/auth/*', (c: Context) => auth.handler(c.req.raw))

// Better Auth Studio routes
app.on(['POST', 'GET', 'PUT', 'DELETE'], '/studio/*', betterAuthStudio(studioConfig))

// Public API entry point. All registered domain routes below require a session.
app.get('/', (c: Context) =>
  c.json({
    message: 'Welcome to the CSK Choir Hub API!',
  }),
)

app.use('*', requireAuth)

/* ---- OpenAPI Documentation Routes ---- */
app.get('/openapi', openAPIRouteHandler(app, openApiOptions))

app.get(
  '/scalar',
  Scalar(() => {
    return {
      url: '/api/openapi',
    }
  }),
)

app.get('/swagger', swaggerUI({ url: '/api/openapi' }))

/* ---- API Routes ---- */
app.route('/', routes) // Main API routes

/* ---- Error Handling Middlewares ---- */
app.onError((error: unknown, c: Context) => {
  try {
    return handleApiError(error, c)
  } catch {
    return c.json({ message: 'Internal Server Error' }, 500)
  }
})

export default app

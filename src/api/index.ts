import { Context, Hono } from 'hono';

import { auth } from '@/lib/auth';

import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import { betterAuthStudio } from 'better-auth-studio/hono';
import { openAPIRouteHandler } from 'hono-openapi';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';

import { openApiOptions } from '@/api/docs/openapi';
import routes from '@/api/routes';
import studioConfig from '@/lib/studio.config';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath('/api');

/* ---- Logging Middleware ---- */
app.use(logger());

/* ---- Authentication ---- */
app.use('*', async (c: Context, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

// better-auth API routes (e.g., /auth/login, /auth/logout, /auth/session)
app.on(['POST', 'GET'], '/auth/*', (c: Context) => auth.handler(c.req.raw));

// Better Auth Studio routes
app.on(['POST', 'GET', 'PUT', 'DELETE'], '/studio/*', betterAuthStudio(studioConfig));

// Public route for testing
app.get('/', (c: Context) =>
  c.json({
    message: 'Welcome to the CSK Choir Hub API!',
  }),
);

/* ---- Only authenticated users can access the following routes ---- */
app.use('*', async (c: Context, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json(
      {
        error: 'Unauthorized',
      },
      401,
    );
  }
  await next();
});

/* ---- OpenAPI Documentation Routes ---- */
app.get('/openapi', openAPIRouteHandler(app, openApiOptions));

app.get(
  '/scalar',
  Scalar(() => {
    return {
      url: '/api/openapi',
    };
  }),
);

app.get('/swagger', swaggerUI({ url: '/api/openapi' }));

/* ---- API Routes ---- */
app.route('/', routes); // Main API routes

/* ---- Error Handling Middlewares ---- */
app.onError((err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  return c.json(
    {
      error: 'Internal Server Error',
    },
    500,
  );
});

export default app;

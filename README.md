# CSK Choir Hub

Next.js app with Hono API routes, Better Auth, Prisma, and a generated Hey API client.

## Development

```bash
bun install
bun run dev
```

The development server prints the local URL it is listening on.

## Code Generation

The API client is generated from a local OpenAPI JSON file. It does not require the app server to be running.

```bash
bun run openapi:spec
bun run openapi-ts
```

The Prisma client is generated into `src/prisma/generated`, which is ignored by git:

```bash
bun run prisma:generate
```

## Deployment

Vercel should use the default project build command:

```bash
bun run build
```

That script runs, in order:

```bash
bun run prisma:migrate
bun run prisma:generate
bun run openapi:spec
bun run openapi-ts
next build
```

Set the variables from `.env.example` in Vercel Project Settings. At minimum, production needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, and either `APP_URL`/`BETTER_AUTH_URL` or Vercel system environment variables exposed.

`OPENAPI_SERVER_URL` is optional. Leave it unset to generate a same-origin API client.

`prisma:migrate` uses `npx prisma migrate deploy`, so production schema changes need committed migration files under `src/prisma/migrations`.

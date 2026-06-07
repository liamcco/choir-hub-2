# CSK Choir Hub

Next.js app, Better Auth, Prisma

## Development

```bash
bun install
bun run dev
```

The development server prints the local URL it is listening on.

## Code Generation

The Prisma client is generated into `src/prisma/generated`, which is ignored by git:

```bash
bun run prisma:generate
```

## Deployment

Set the variables from `.env.example` in Vercel Project Settings. At minimum, production needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, and either `APP_URL`/`BETTER_AUTH_URL` or Vercel system environment variables exposed.

`prisma:migrate` uses `npx prisma migrate deploy`, so production schema changes need committed migration files under `src/prisma/migrations`.

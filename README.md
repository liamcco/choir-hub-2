# CSK Choir Hub

Next.js app, Better Auth, Prisma

## Development

Copy `.example.env` to `.env` and fill in the required values before starting the app:

```bash
cp .example.env .env
```

```bash
bun install
bun run dev
```

The development server prints the local URL it is listening on.

To reset the local database and run its seed, select “Reset local database” from the CLI:

```bash
bun run cli
```

This command refuses to run unless `DB_MODE=local`.

## Code Generation

The Prisma client is generated into `src/prisma/generated`, which is ignored by git:

```bash
bun run prisma:generate
```

## Script CLI

Run the interactive script menu with:

```bash
bun run cli
```

Use the arrow keys and Enter to choose an admin bootstrap, demo seed, or foundation seed. The admin bootstrap defaults to `admin@example.com`, password `password`, and name `Local Admin`, and can prompt for custom values.

## Codebase Health

Current baseline gaps:

- The repo has no `*.test.*` or `*.spec.*` files yet, so `bun test` exits with "No tests found!" until the first tests are added.
- `bun run auth:generate` prompts before overwriting `src/prisma/schema/auth.prisma`; use it only when intentionally regenerating the auth schema.

## Deployment

Set the variables from `.env.example` in Vercel Project Settings. At minimum, production needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, and either `APP_URL`/`BETTER_AUTH_URL` or Vercel system environment variables exposed. The CLI's `foundation-seed` route uses `DATABASE_URL_PROD` instead of `DATABASE_URL` when `DB_MODE=prod`, and fails if the production URL is missing.

Email delivery is deliberately scoped by environment. Keep `EMAIL_MODE=log` for local development and Vercel previews; the app rejects SMTP mode outside production, so local auth flows cannot accidentally send real mail. In the production Vercel environment, set `EMAIL_MODE=smtp`, `ENVIRONMENT=production`, and `VERCEL_ENV=production`, plus real Gmail SMTP credentials:

```text
GMAIL_SMTP_USER=your-production-account@example.com
GMAIL_SMTP_APP_PASSWORD=<16-character Google app password>
```

Production SMTP credentials are validated at startup. Missing values or the placeholder values from `.env` fail with an explicit configuration error. Use a Google app password, not the account password.

`prisma:migrate` uses `npx prisma migrate deploy`, so production schema changes need committed migration files under `src/prisma/migrations`.

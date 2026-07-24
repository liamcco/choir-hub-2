# CSK Choir Hub

CSK Choir Hub is an internal choir administration app built with Next.js 16, React 19, Better Auth, Drizzle ORM, PostgreSQL, Bun, Tailwind CSS, and shadcn/ui-style components.

The current app includes email/password authentication, account password self-service, global admin access control, organization overview screens, and admin workflows for Members, Groups, Group Memberships, Positions, and Position Assignments.

## Prerequisites

- [Bun](https://bun.sh/) 1.3.14 (the version pinned in `package.json`)
- Docker with Docker Compose, or another PostgreSQL instance

## Local setup

1. Install dependencies and create the local environment file:

   ```bash
   bun install --frozen-lockfile
   cp .example.env .env
   ```

2. Review `.env`. The committed template is configured for the Docker database and log-only email delivery.

   > [!IMPORTANT]
   > Replace `BETTER_AUTH_SECRET` outside disposable local environments.

3. Start PostgreSQL. You can use the bundled Docker container:

   ```bash
   docker compose up -d db
   ```

   Alternatively, use any PostgreSQL instance you control and set `DATABASE_URL` in `.env` to its connection string. The `POSTGRES_*` variables in `.env` configure only the bundled Docker container; you can reuse those credentials for your own local database or replace them as needed.

4. Create the database schema and generate the Drizzle client:

   ```bash
   bun run db:push
   ```

   Until the repository does not yet contain a committed `src/drizzle/migrations` history, `db push` is the current fresh-database bootstrap. It is for local setup only; contributed schema changes must use migrations as described in [CONTRIBUTING.md](./CONTRIBUTING.md#drizzle-schema-and-migrations).

5. Optionally load development data and create an admin account:

   ```bash
   bun run cli
   ```

   The interactive CLI can run the foundation seed, demo seed, admin bootstrap, or local database reset. The default bootstrap account is `admin@example.com` / `password` with the name `Local Admin`; use custom values for anything other than a disposable local database. The reset command refuses to run unless `DB_MODE=local` and relies on Drizzle migration history.

## Local development

Install dependencies:

```bash
bun i
```

Start the app:

```bash
bun run dev
```

Next.js prints the local URL, normally `http://localhost:3000`. Email is written to the terminal while `EMAIL_MODE=log`. Set `LOG_DATABASE=true` when query logging is useful during local diagnosis.

Useful database commands:

```bash
bun x drizzle-kit studio
bun x drizzle-kit check
bun run db:push
```

Drizzle schema definitions are checked in under `src/drizzle/schema`; the build does not generate or mutate database artifacts.

## Tests and code quality

The repository has Bun tests for authentication and permissions, navigation, logging, email configuration, account workflows, organization domain behavior, admin actions, and the admin bootstrap script.

```bash
bun test                 # all tests
bun run lint             # Biome checks
bun run lint:fix         # apply safe Biome fixes
bun run format           # format supported files
bun run build            # production Next.js build
bun run pr               # run before PR submission
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for project structure, authorization, database, UI, logging, and documentation conventions.

## Environment variables

`.example.env` documents the local defaults. Runtime validation is defined in `src/core/config/env.ts`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the app and Drizzle |
| `DATABASE_URL_PROD` | Connection selected by runtime and CLI code when `DB_MODE=prod` |
| `DB_MODE` | `local` or `prod`; protects destructive/reset and production CLI workflows |
| `BETTER_AUTH_URL` | Canonical Better Auth base URL |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `SITE_URL` / `API_BASE_URL` | Public site and API base URLs |
| `ENVIRONMENT` | `development`, `test`, or `production` |
| `VERCEL_ENV` | Vercel environment; `production` forces production behavior |
| `EMAIL_MODE` | `log` locally/previews or `smtp` in production |
| `GMAIL_SMTP_USER` / `GMAIL_SMTP_APP_PASSWORD` | Gmail SMTP credentials used only in production SMTP mode |
| `LOG_DATABASE` | Set to `true` to include Drizzle query logs |

The Docker-only `POSTGRES_*` variables configure the local container. Keep `.env` uncommitted.

## Deployment

The application currently assumes a Vercel-style deployment with a reachable PostgreSQL database, but the repository has no `vercel.json`, CI deployment workflow, Docker production image, or application health endpoint. Configure the platform's install/build/start behavior from the scripts in `package.json`; `bun run build` generates Drizzle Client through `prebuild`.

Production requires at least:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`, `SITE_URL`, and `API_BASE_URL` set to the deployed HTTPS origin
- `ENVIRONMENT=production` (Vercel production also supplies `VERCEL_ENV=production`)
- `EMAIL_MODE=smtp`, `GMAIL_SMTP_USER`, and `GMAIL_SMTP_APP_PASSWORD` for real email delivery

SMTP is rejected outside production. Production SMTP credentials are validated and placeholder values fail fast. Use a Google app password, not the account password. Keep `EMAIL_MODE=log` in local and preview environments.

Database migrations are not applied by `build` or `start`. Once migration files exist, the deployment pipeline must run this separately before serving the new version:

```bash
bun x drizzle-kit migrate
```

At present there is no committed migration history, so an existing production database must already match the Drizzle schema or be provisioned through an explicitly reviewed operational process. Do not run `drizzle-kit push` against production as an implicit deployment step.

Before deployment, run the repository's full verification command:

```bash
bun run pr
```

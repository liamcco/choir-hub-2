# Production launch checklist

Use this checklist for the first production launch and for releases that change the database schema. The application currently assumes a Vercel-style deployment with a reachable PostgreSQL database; adapt the platform-specific commands to the hosting provider.

## 1. Configure production environment

Set these values in the production runtime. Do not use the development defaults from `.example.env` or commit secrets.

- `DATABASE_URL`: the production PostgreSQL connection used by the running application and Drizzle commands.
- `BETTER_AUTH_SECRET`: a newly generated, long random secret. Replacing it later invalidates existing sessions.
- `BETTER_AUTH_URL`: the deployed HTTPS origin.
- `ENVIRONMENT=production`.
- `EMAIL_MODE=smtp`.
- `GMAIL_SMTP_USER`: the Gmail account used for application email.
- `GMAIL_SMTP_APP_PASSWORD`: a Google app password for that account, not the account password.

When using the production CLI, also provide:

- `DB_MODE=prod`.
- `DATABASE_URL_PROD`: the production database connection selected by the CLI. This is intentionally separate from the runtime variable so an operator must explicitly target production.

`VERCEL_ENV=production` may be supplied by Vercel and forces production behavior. Leave `LOG_DATABASE` unset or `false` unless temporary query logging has been explicitly approved. Never enable it to capture secrets or sensitive data in normal operation.

Before continuing, verify that URLs use HTTPS, the database is reachable from the deployment environment, and no placeholder secret or SMTP value remains.

## 2. Provision and protect the database

- Provision a production PostgreSQL database and credentials with the required network access.
- Confirm that the target database is the intended production database, not a local, E2E, or preview database.
- Take a backup or snapshot immediately before applying migrations.
- Ensure the release migrations are present in the release commit.
- Do not use `drizzle-kit push` in production.

## 3. Pass the release gate

From the release commit, run:

```bash
bun run pr
```

This must pass before deployment. It runs the unit tests, isolated E2E tests, lint, and production build. The E2E suite must use the separate database configured by `DATABASE_URL_E2E`; never point it at production.

## 4. Apply migrations

Run the committed migrations separately from the application build/start command:

```bash
DATABASE_URL="$DATABASE_URL_PROD" bun x drizzle-kit migrate
```

Alternatively, run the command with the production `DATABASE_URL` already supplied by the deployment environment. `build` and `start` do not apply migrations.

If migration fails, stop the rollout. Do not serve the new application version and do not attempt an ad hoc reverse migration. Preserve the failure details and use the reviewed backup/recovery procedure before retrying.

## 5. Bootstrap the first administrator

After migrations succeed, run the interactive CLI against production:

```bash
DB_MODE=prod DATABASE_URL_PROD="$DATABASE_URL_PROD" bun run cli
```

Choose **Bootstrap admin account**, choose custom credentials, and use a strong operator-supplied password. The bootstrap operation creates the user with the `admin` role, or promotes an existing user without changing that user’s password.

- Do not use the default `admin@example.com` / `password` credentials in production.
- Do not run the demo seed in production.
- Do not run the database reset command in production as part of launch.
- Do not place the admin password in source control or persistent deployment configuration.

## 6. Deploy and smoke-test

- Deploy or activate the release after migrations and admin bootstrap succeed.
- Confirm that the first admin can sign in and reach an admin-only area.
- Verify that password self-service or another real email flow sends mail through SMTP.
- Confirm that ordinary users cannot access admin-only workflows.
- Check application and deployment logs for startup, database, authentication, and email errors.

Only open the application to users after these checks pass.

## 7. Rollout recovery

If migration, startup, authentication, or email verification fails, stop the rollout and keep the application unavailable to users until the issue is understood. Use the pre-migration backup and the hosting platform’s reviewed rollback procedure where necessary. Schema changes must be corrected with a new reviewed migration; never edit an already-deployed migration.

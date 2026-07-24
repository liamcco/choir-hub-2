# Replace Drizzle with Drizzle

## Status

Accepted

## Context

The application currently uses Drizzle for the database client, schema, Better Auth adapter, seeds, database scripts, generated types, and development guidance. The local and production databases are disposable and may be recreated. There is no committed Drizzle migration history.

The application needs a full ORM replacement rather than a period of dual-ORM operation. The existing database behavior and choir-domain model should remain unchanged during the transition.

## Decision

Replace Drizzle completely with Drizzle. Drizzle will be the only application ORM, schema source, and future migration tool.

- Keep separate Drizzle schema files for Better Auth and choir-domain tables under `src/drizzle/schema`.
- Treat the checked-in Better Auth schema as repository-owned and manually reviewed after generator output; generated output must not overwrite the choir-specific `User.status` field or other reviewed changes.
- Keep the application-facing database seam under `src/core/db`.
- Use Drizzle with `postgres-js`.
- During development, apply schema changes with `drizzle-kit push`.
- Defer the initial committed production migration until the schema stabilizes; generate and review that baseline before the first production deployment.
- Preserve current tables, columns, enum values, indexes, partial uniqueness rules, foreign keys, cascades, transactions, and query-visible behavior.
- Update all repository documentation and scripts so no Drizzle references remain.

## Consequences

The transition can recreate every disposable database and does not need a Drizzle-to-Drizzle data migration or migration-history conversion. It does require replacing Drizzle-generated types and query APIs throughout application code, seeds, tests, E2E fixtures, Better Auth integration, scripts, and build/test guidance.

The Better Auth schema generator remains useful as a reviewed input when auth plugins change, but the checked-in Drizzle schema is the final source of truth. A production baseline migration is intentionally postponed, so the stabilized schema must be tested and reviewed before that migration is generated.

## Verification

The transition is complete when a fresh disposable PostgreSQL database accepts `drizzle-kit push`; all seeds and admin bootstrap succeed; unit, lint, build, and E2E checks pass; the configured Better Auth flows continue to work; and no Drizzle packages, configuration, generated artifacts, imports, commands, or documentation references remain.

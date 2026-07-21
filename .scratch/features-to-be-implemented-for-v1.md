# Features to be implemented for v1

## Scope

V1 is the current app surface only: login, account self-service, organization overview, and admin management for Members, Groups, Group Memberships, Positions, and Position Assignments.

The goal is production-usable, polished, and ready to grow. Do not expand v1 into events, attendance, content, or other future product domains unless a hard launch dependency appears.

## Infrastructure

- [] Add proper application logging infrastructure, including audit logging for security-relevant events such as denied authorization attempts, admin actions, and account access changes. The access-control v1 plan may proceed before this exists, but permission denials should remain identifiable enough to log once the logger is introduced.
- [] Add type-safe environment variable handling in `src/core/environment`, replacing direct scattered `process.env` reads with validated server-side configuration and clear public/server boundaries.
- [] Add `.env.example` and keep it aligned with the validated environment schema, including database, Better Auth, app URL, email, logging, and bootstrap variables.
- [] Add great developer experience for local, preview, and production database workflows:
  - [] make it clear which database each command and environment uses
  - [] provide safe local setup/reset/seed commands
  - [] document production database migration and bootstrap flow
  - [] document Vercel preview database configuration
  - [] prefer a separate test/preview database for Vercel preview deployments so preview builds never touch production data
- [] Verify scoped email behavior:
  - [] local/dev email mode must not send real mail accidentally
  - [] production SMTP configuration must be documented and fail clearly when incomplete
  - [] account-related email behavior should be covered by focused tests or a documented smoke check

## Access Control And Security

- [x] Finish the access-control permission module from `.scratch/access-control-permissions/spec.md`.
- [x] Implement the remaining access-control tickets:
  - [x] shared Better Auth permission foundation
  - [x] hardened admin bootstrap
  - [x] admin route and navigation enforcement based on resolved session facts, not only cached session-cookie presence
  - [x] service-level authorization for organization-management writes
  - [x] current-actor Group Membership and Position Assignment predicates
  - [x] rollout verification
- [x] Hide admin navigation from authenticated non-admin users and return a forbidden result for authenticated non-admin access to `/admin` routes.
- [] Run a scoped security hardening pass for the current surface:
  - [] auth/session configuration
  - [] public route exposure
  - [] admin route and mutation enforcement
  - [] CSRF/server-action assumptions
  - [] sensitive data in logs and errors
  - [] production headers or hosting-provided equivalents
  - [] dependency and config review for launch-critical risk

## Product Surface Polish

- [] Greatly revise the admin UI. It should be easy to use for repeated management work, not merely functionally complete.
- [] Add a logout button to the authenticated navbar.
- [] Add a product-quality pass for empty, loading, error, and forbidden states across login, account, organization overview, and admin screens.
- [] Add polished pending states and mutation feedback for admin workflows.
- [] Ensure responsive behavior works on practical mobile and desktop widths, especially admin tables, forms, dialogs, and navigation.
- [] Include accessibility QA for the current surface:
  - [] keyboard navigation
  - [] visible focus states
  - [] form labels and errors
  - [] dialog/menu usability
  - [] readable contrast
  - [] layouts that do not overflow or overlap

## Next.js Instant Navigation

- [] Audit the current routes against Next's Cache Components and Instant Navigation guidance in `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.
- [] Decide route by route whether data should be cached with explicit `cacheLife`, streamed behind `Suspense`, or intentionally opted out of instant validation.
- [] Replace broad `export const instant = false` usage with deliberate route-level decisions.
- [] Add meaningful `Suspense` fallbacks where uncached data, runtime APIs, or dynamic route work should stream.
- [] Verify app navigation with Next DevTools Navigation Inspector during development.
- [] Add automated coverage for the most important instant-navigation behavior where practical, using the Next/Playwright instant-navigation testing APIs if they fit this repo version.

## Documentation

- [] Write `CONTRIBUTING.md` with clear guidelines for:
  - [] project setup
  - [] local development
  - [] testing and linting
  - [] adding new features
  - [] route/page structure
  - [] feature module structure
  - [] service/action boundaries
  - [] authorization expectations
  - [] Prisma schema and migration discipline
  - [] UI conventions
  - [] documentation and ADR expectations
- [] Update `README.md` so it matches the actual repo state, including existing tests, environment setup, Prisma generation, deployment assumptions, and production verification commands.
- [] Document the launch-time production checklist: env vars, database, first admin bootstrap, email mode, build/test gate, and deployment/migration order.

## Data, Seeds, And Migrations

- Do not commit partial Prisma migrations while v1 schema is still moving.
- [] Once v1 is verified and finished, record the first committed Prisma migration as the v1 baseline.
- [] Add separated seed paths:
  - [] operational/bootstrap seed data for production needs only
  - [] demo/dev/e2e seed data with realistic choir Members, Groups, Positions, Group Memberships, and Position Assignments
- [] Ensure the first-admin bootstrap path is idempotent, documented, and verified before admin route enforcement is treated as production-ready.

## Verification And Release Gate

- [] Add a minimal end-to-end smoke suite for production-critical flows:
  - [] login with a known test user
  - [] authenticated access to organization/account routes
  - [] non-admin denial for admin routes
  - [] admin access to admin routes
  - [] one representative admin CRUD workflow
- [] Provide predictable test database setup for the smoke suite using the separated demo/dev/e2e seed path.
- [] Add or document a release gate that runs the core checks before deploy:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
  - `bun run test:e2e`
- Treat v1 as complete only after the current surface passes automated checks plus the manual product-quality, responsive, accessibility, and security hardening passes above.

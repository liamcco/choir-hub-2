# Contributing to CSK Choir Hub

This repository uses Bun, Next.js App Router, Better Auth, Drizzle/PostgreSQL, Biome, Tailwind CSS, and shadcn/ui-style primitives. Keep changes feature-oriented, protect every server boundary, and preserve the domain vocabulary in `CONTEXT.md`.

## Project setup

Install the pinned Bun dependencies, copy the committed environment template, and start PostgreSQL:

```bash
bun i
cp .example.env .env
docker compose up -d db
bun run db:push
bun run db:push
```

`drizzle-kit push` is temporarily required to bootstrap a fresh local database because the repository has no committed migration history. Do not use it to submit a schema change or update production. See [Drizzle schema and migrations](#drizzle-schema-and-migrations).

Use `bun run cli` to run foundation/demo seeds or bootstrap a local admin. Never commit `.env`, credentials, generated Drizzle files, `.next`, or local database artifacts.

## Local development

Run `bun run dev` and use the URL printed by Next.js. Keep `EMAIL_MODE=log` locally; email content is written to the terminal rather than sent. `LOG_DATABASE=true` enables query logs when diagnosing database behavior.

Use the `@/` aliases from `tsconfig.json` for source imports.

## Testing and linting

Add or update focused tests with behavior changes. Tests live beside the module they cover as `*.test.ts` or `*.test.tsx`; script tests live under `scripts/`.

```bash
bun test                         # full suite
bun test path/to/module.test.ts  # focused test file
bun run lint                     # Biome check
bun run lint:fix                 # apply Biome fixes
bun run format                   # format supported files
bun run build                    # production build
bun run pr                       # run before PR submission
```

Test through public module interfaces. Prefer focused coverage for domain invariants, validation, authorization, write behavior, and meaningful UI workflows. Avoid snapshots of incidental markup and tests coupled to private implementation details.

Run `bun run pr` before handing off a change. For Drizzle changes, also run `bun x drizzle-kit check` and test the generated migration against a disposable local database.

## Adding a feature

Before implementation:

1. Read `CONTEXT.md` and the ADRs relevant to the affected domain.
2. Read `docs/codebase-structure.md`.
3. Check `.scratch/` for the feature spec or issue. Local tracker conventions are in `docs/agents/issue-tracker.md`.
4. Read the installed Next.js guide for any framework convention you will touch.

Then:

1. Put durable product behavior under `src/features/<capability>`, not under a route name or user role.
2. Define or reuse a narrow public entrypoint (`index.ts`) for callers outside the feature/subfeature.
3. Keep domain rules and persistence behavior behind feature interfaces rather than duplicating them in pages or forms.
4. Add authorization and validation at server boundaries before mutation.
5. Add focused tests and update relevant docs in the same change.
6. Record decisions that are surprising, cross-cutting, or hard to reverse in an ADR.

Do not move code into `src/shared` merely because two call sites look similar. Share it when the concept and interface are stable and doing so improves locality.

## Route and page structure

`src/app` owns URL topology and Next.js convention files only:

- `(public)` contains routes that do not require authentication, currently `/login`.
- `(app)` provides the authenticated application layout. The route-group name does not appear in the URL.
- `(app)/admin` contains admin URLs; `src/proxy.ts` classifies the entire `/admin` prefix as admin-only.
- `api/[[...route]]/route.ts` exposes the Better Auth catch-all handler.

Keep `page.tsx`, `layout.tsx`, loading/error files, and route handlers thin. They should select routing behavior, compose a screen, and delegate inward. A feature page should normally import a screen from a public feature entrypoint, for example:

```tsx
import { MembersScreen } from '@/features/organization/management/members'

export default function MembersPage() {
  return <MembersScreen />
}
```

Server Components are the default. Add `'use client'` only at the lowest component that needs event handlers, state, effects, a client hook, or browser APIs. A route group organizes layouts without affecting URLs; a normal directory creates a URL segment once it contains `page.tsx` or `route.ts`.

Add canonical paths and navigation metadata in `src/core/navigation` rather than scattering string literals. When adding access-sensitive routes, update route policy and navigation tests as well as the page.

## Feature module structure

Use these top-level ownership boundaries:

- `src/features`: product capabilities and domain behavior.
- `src/shared`: stable, genuinely cross-feature UI and generic helpers.
- `src/core`: infrastructure, adapters, configuration, auth, database, logging, and app-shell wiring.
- `src/app`: framework route topology.
- `src/drizzle`: split schema files, seeds, and generated client output.

Within a substantial feature, use only the seams the feature needs. Existing organization modules illustrate the preferred vocabulary:

```text
src/features/organization/
├── core/                         domain rules and persistence operations
├── components/                   organization-specific reusable UI
├── overview/                     screen and screen-shaped reads
└── management/<workflow>/
    ├── index.ts                  public entrypoint
    ├── screen.tsx                page-level composition
    ├── service.ts                screen reads or reusable operations
    ├── actions.ts                server form boundary
    ├── schemas.ts                input validation
    ├── *-form.tsx                interactive feature UI
    └── *.test.ts(x)              focused tests
```

Do not create empty layers or shallow pass-through modules just to match the diagram. A module should hide meaningful behavior. Dependencies must follow `docs/codebase-structure.md`: app may import feature entrypoints/core/shared; features may import core/shared; shared must not import core/features; core must not import features; cross-feature imports go through the target feature's public entrypoint.

## Service and action boundaries

Treat Server Actions as untrusted request boundaries even when their forms render only on protected pages. The current form workflow is:

1. authenticate/authorize;
2. parse and validate untrusted form data with Zod;
3. call a feature/domain operation that owns business invariants and persistence;
   - translate known domain errors into the caller's response shape;
   - emit the required audit event;
4. revalidate affected route constants and navigate when needed.
5. Navigate (optional)

Keep `actions.ts` concerned with that request workflow. Do not put reusable domain rules, raw Drizzle query logic, or large read models there.

Use `service.ts` for server-only screen-shaped reads or a feature operation interface. Put durable organization invariants in `src/features/organization/core` and expose them through `organizationService`. Mark server-only modules with `import 'server-only'` when importing them into client code would be unsafe.

Authorization must exist at the first independently callable authoritative server boundary. A mutation exposed only through a Server Action must enforce there. If mutation logic is extracted into a service that can also be called by a route handler, script, job, or another action, enforce authorization in that reusable write service; caller-side checks may improve UX but are not sufficient protection. Do not create a publicly callable unguarded mutation service.

## Authorization expectations

Route protection, navigation visibility, and operation authorization are separate responsibilities:

- `src/proxy.ts` and `src/core/auth/route-access.ts` provide coarse page access: `/login` is public, ordinary app routes require a session, and `/admin` requires the global `admin` Access Role.
- Navigation uses boolean checks only to decide which links to show. Hidden UI is never authorization.
- Every Server Action, route handler, or reusable write service must enforce its own authorization before privileged reads, validation work that can leak facts, mutations, or Better Auth admin operations.

Use the helpers in `@/core/auth/permissions.server`:

- `canCurrentUser` and `userIsAdmin` are non-authoritative UI/read affordances.
- `requireCurrentUserPermission` and `requireAdmin` are enforcing boundaries.
- `canCurrentUserInGroup` / `requireCurrentUserInGroup` and `canCurrentUserHoldPosition` / `requireCurrentUserHoldsPosition` are narrow current-actor domain predicates.

Let `AuthorizationDeniedError` interrupt the operation. Do not turn authorization denial into a normal form validation error. Browser pages should redirect anonymous users to login and return forbidden behavior for authenticated-but-unauthorized users; APIs should distinguish `401` from `403`.

When changing permissions, update the shared definitions and server/client wiring described in `src/core/auth/README.md`, then run its focused verification commands.

## Drizzle schema and migrations

Drizzle owns a multi-file schema under `src/drizzle/schema`:

- `drizzle.config.ts` owns the Drizzle Kit configuration and PostgreSQL connection.
- `auth.ts` owns Better Auth tables and reviewed custom User fields.
- `organization.ts` owns choir organization models.
- Future capabilities should get their own schema file rather than accumulating unrelated models in an existing file.

Schema files under `src/drizzle/schema` are checked in and reviewed. Use `bun run db:push` for disposable development databases.

For a schema contribution:

1. Make the smallest coherent edit in the owning schema file.
2. Review relevant domain terminology and ADRs.
3. Create a named development migration against a disposable local database:

   ```bash
   bun x drizzle-kit generate --name concise_change_name
   ```

4. Inspect the generated SQL. Add deliberate SQL for constraints Drizzle cannot express, such as partial indexes.
5. Commit the schema files and the complete `src/drizzle/migrations/<timestamp>_<name>/migration.sql` directory together.
6. Run:

   ```bash
   bun x drizzle-kit check
   bun run db:push
   bun test
   bun run build
   ```

The repository currently has no committed migration history. The first migration-bearing change must establish a reviewed baseline or an agreed migration path for existing databases; do not casually generate an “initial” migration and assume it is safe for production.

Never use `drizzle-kit push` as a production migration or as the submitted record of a schema change. Do not edit an already-deployed migration; add a new migration. Production deployment must run `bun x drizzle-kit migrate` separately because build/start do not apply migrations.

Keep foundation seeds idempotent and limited to durable operational/domain records. Put realistic people and relationship fixtures in the demo seed. Use stable IDs for data referenced by tests or fixtures. Destructive reset tooling must remain guarded by `DB_MODE=local`.

## UI conventions

Build mobile-first and verify narrow and desktop layouts. Reuse primitives in `src/shared/ui` for common controls, dialogs, tables, forms, feedback, and navigation. Keep feature-specific compositions inside their feature; promote a component to shared only when its cross-feature interface is stable.

The shadcn configuration targets `@/shared/ui`, `@/shared/utils`, and `@/shared/hooks`. Preserve those aliases when adding generated components. Use Lucide icons and the existing CSS-variable theme rather than introducing a parallel icon or styling system.

Prefer Server Components. Keep client boundaries low, provide pending feedback for mutations, and use optimistic updates only when rollback is clear. Use semantic HTML and accessible labels, keyboard behavior, focus management, and useful empty/error states. Avoid large monolithic TSX files, but do not split JSX into fragments that hide no complexity.

## Documentation and ADRs

Use the exact domain terms in `CONTEXT.md`; respect the explicit “Avoid” synonyms. Update the glossary when a genuinely new domain concept is agreed, not as a substitute for choosing existing language.

ADRs live in `docs/adr/`. Add one when a decision is surprising, cross-cutting, expensive to reverse, changes a documented architectural boundary, or intentionally contradicts an earlier decision. Reference the superseded/contradicted ADR explicitly rather than silently overriding it.

Update documentation in the same change when commands, environment variables, deployment assumptions, public module boundaries, route policy, or contributor workflow change. Keep feature specs and issues under `.scratch/<feature>/` according to `docs/agents/issue-tracker.md`; do not use README or ADRs as an issue log.

## Logging

Runtime application code uses the structured logger from `@/core/logging`, not ad hoc `console.log` calls:

```ts
import { logger } from '@/core/logging'

logger.info('organization.group.import.completed', { actorUserId, groupCount })
```

Use stable, dot-separated event names and structured context values that operators can search. Record stable identifiers, counts, state, and error categories; do not log passwords, secrets, tokens, cookies, SMTP credentials, raw request bodies, or unnecessarily sensitive personal data.

Use the `audit` facade for security-relevant events it already models: authorization denial, completed admin actions, and account-access changes. Extend the facade when a new recurring security event needs a consistent shape. Audit after a mutation succeeds unless the event specifically records an attempted/denied action.

The logger emits one JSON object per line and is intentionally best-effort: logging failures must not break requests. CLI scripts may use `console` for interactive/operator output; application runtime events should use the structured logger. Enable Drizzle query logging only for deliberate diagnosis and avoid it in normal production operation.

# Architecture

This document summarizes how this repository differs from a basic `create-next-app` scaffold.

Baseline assumption: a plain TypeScript App Router project with `src/`, Tailwind CSS, React, Next.js, a single home page, and the default Next development/build scripts. Everything below is an addition, replacement, or project-specific convention layered on top of that baseline.

## Application Shape

- The app is named `csk-choir-hub` and is intended to become an internal choir portal.
- The visible App Router surface is still small: `src/app/page.tsx` renders a simple welcome page, and `src/app/api/[[...route]]/route.ts` delegates API handling to Better Auth.
- Request gating is handled through `src/proxy.ts`, which redirects unauthenticated non-public page requests to `/login`. Public paths are currently `/login`; `/admin` paths are identified separately but currently only require a session.
- Runtime environment helpers live in `src/common/environment/environment.ts`.

## Package Manager and Runtime

- The project uses Bun as the package manager and command runner.
- `package.json` declares `packageManager: bun@1.3.14`.
- Scripts use Bun directly:
    - `bun --bun next dev`
    - `bun --bun next build`
    - `bun --bun next start`
    - `bun test`

## Database Layer

- Prisma ORM has been added with PostgreSQL as the database.
- Prisma configuration lives in `prisma.config.ts`.
- Schema files are under `src/prisma/schema`.
- The Prisma client generator writes to `src/prisma/generated` instead of the default generated client location.
- `src/db/prisma.ts` creates the shared Prisma client using `@prisma/adapter-pg`.
- In non-production environments, the Prisma client is cached on `global` to avoid creating extra clients during hot reload.
- Query logging can be enabled with `LOG_PRISMA=true`.

## Data Model

In addition to Better Auth tables, the Prisma schema contains domain models for choir organization in `src/prisma/schema/organization.prisma`:

- `GroupKind`
- `Group`
- `MemberStatus`
- `Member`
- `GroupMembership`
- `Position`
- `PositionScope`
- `PositionAssignment`

These model group hierarchies, Members backed by required unique auth user identities, historical group memberships, positions, position scopes, and historical position assignments. Choir-domain relations stay out of the auth-owned `User` model.

## Authentication

- Better Auth has been added as the authentication framework.
- `src/lib/auth.ts` is the server-side auth configuration.
- `src/lib/auth-client.ts` creates the client-side Better Auth client.
- The auth API is mounted through `src/app/api/[[...route]]/route.ts`.
- Prisma is used as the Better Auth database adapter.
- Auth is configured with:
    - email/password sign-in
    - disabled public sign-up
    - production-only email verification requirement
    - session cookie caching
    - secure cookie behavior based on `BETTER_AUTH_URL`
    - password reset hooks
    - email verification hooks
- Better Auth plugins enabled:
    - username
    - admin
    - OpenAPI
    - two-factor auth
    - passkeys
    - email OTP
    - Next.js cookies integration

## UI System

- The base Tailwind setup has been expanded into a shadcn/ui-style component system.
- `components.json` configures shadcn/ui with:
    - `base-nova` style
    - React Server Components enabled
    - TypeScript enabled
    - Lucide icons
    - aliases for `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, and `@/lib/utils`
- Many reusable components live under `src/components/ui`, including buttons, dialogs, dropdowns, sidebar, command menu, calendar, chart, form controls, navigation, and overlays.
- The components are built mostly on `@base-ui/react`, shadcn conventions, Tailwind utility classes, `class-variance-authority`, and `tailwind-merge`.
- `src/lib/utils.ts` provides the common `cn` class merging helper.
- `src/app/globals.css` contains the Tailwind v4 setup, shadcn imports, custom theme tokens, dark mode variables, chart/sidebar tokens, and base layer styling.

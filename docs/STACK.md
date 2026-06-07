# Stack Overview

## Core

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Runtime / package manager:** Bun
- **Styling:** Tailwind CSS v4 + shadcn/ui components

## Backend

- **API framework:** Hono mounted under `src/app/api/[[...route]]/route.ts`
- **Validation + docs:** Zod + `hono-openapi`
- **Auth:** Better Auth (`src/lib/auth.ts`)
- **Database ORM:** Prisma + PostgreSQL adapter (`@prisma/adapter-pg`)

## Frontend data and forms

- **Data fetching/cache:** TanStack Query
- **Forms:** React `useActionState` for simple server actions, TanStack Form for richer client forms

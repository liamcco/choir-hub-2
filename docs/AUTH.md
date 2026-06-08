# Authentication

This project uses **Better Auth** with the Prisma adapter.

## Key files

- Server auth config: `src/lib/auth.ts`
- Client auth helpers: `src/lib/auth-client.ts`
- Login page/action:
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/login/login-form.tsx`
  - `src/app/(auth)/login/actions.ts`

## Behavior

- Session is read from request headers/cookies.
- API middleware sets `user`/`session` context.
- Protected API routes return `401` when unauthenticated.

## Important notes

- `BETTER_AUTH_URL` must be set.
- Keep `src/prisma/schema/auth.prisma` managed by auth tooling.
- Auth endpoints are mounted at `/api/auth/*`.

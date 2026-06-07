# Authentication

This project uses **Better Auth** with the Prisma adapter.

## Behavior

- Session is read from request headers/cookies.
- API middleware sets `user`/`session` context.
- Protected API routes return `401` when unauthenticated.
- Admin API routes under `/api/admin/*` require `user.role === "admin"` and return `403` for authenticated non-admin users.

## Important notes

- `BETTER_AUTH_URL` must be set.
- Keep `src/prisma/schema/auth.prisma` managed by auth tooling.
- Auth endpoints are mounted at `/api/auth/*`.

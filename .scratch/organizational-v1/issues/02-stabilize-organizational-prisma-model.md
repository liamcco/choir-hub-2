# 02 — Stabilize the organizational Prisma model

**What to build:** Make the v1 organizational model migration-ready and generated cleanly, matching the settled domain decisions for Groups, Members, Group Memberships, Positions, Position Scopes, and Position Assignments.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Group Kind is a constrained v1 vocabulary: choir, section, committee, board, and project.
- [x] Member has one overall Member Status: active, passive, or former.
- [x] Member is separate from auth User and uses a required unique user identity link without adding choir-domain relations back to auth User.
- [x] Group Membership is historical with start and optional end dates and has no separate status.
- [x] Position Scope supports a Position being relevant to one or more Groups.
- [x] Position Assignment is historical with start and optional end dates.
- [x] Position has no current-holder fields and Position names are not globally unique.
- [x] The former Group container flag and User Group Membership model are gone.
- [x] Prisma format and generation pass.

## Comments

- Implemented in Prisma schema split: generator/datasource remain in `src/prisma/schema/schema.prisma`; organizational models live in `src/prisma/schema/organization.prisma`.
- Verified with `bun x prisma format`, `bun x prisma generate`, `bun x tsc --noEmit`, `bun run lint`, `bun x prisma db push --force-reset`, and `bun x prisma migrate reset --force` against the local database.
- `bun test` still exits with "No tests found!" because the repo has no test files yet.

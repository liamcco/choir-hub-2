# Research Better Auth access-control integration

Type: research
Status: resolved
Blocked by:
Parent: ../map.md

## Question

Exactly how should this project define Better Auth roles/scopes and perform permission checks using the installed Better Auth version?

Confirm the relevant APIs from primary sources available to the repo, including `createAccessControl`, `role`, `admin()` options, client/server permission checks, multi-role behavior, type inference, and any constraints around storing comma-separated roles in the existing auth User schema.

## Answer

Research findings are captured in [`better-auth-access-control.md`](../research/better-auth-access-control.md).

In short: keep CSK Choir Hub's v1 access roles in Better Auth's global admin access-control model. Define one `statement` object `as const`, create `ac = createAccessControl(statement)`, derive named roles with `ac.newRole(...)`, export a shared `roles` object, and pass the same `ac`/`roles` to both `admin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] })` and `adminClient({ ac, roles })`.

Use Better Auth's built-in checks for role/scope authorization: server-side `auth.api.userHasPermission({ body: { userId, permissions } })`, `auth.api.userHasPermission({ body: { role, permissions } })`, or direct role authorization where appropriate; client-side `authClient.admin.hasPermission({ permissions })` and `authClient.admin.checkRolePermission({ role, permissions })` should be treated as UI-affordance checks, not the authoritative enforcement boundary.

The existing `src/prisma/schema/auth.prisma` `User.role String?` field is compatible with the installed Better Auth admin plugin. Multiple Better Auth roles are intentionally stored in that string as comma-separated values. Role names should therefore avoid commas, stored multi-role strings should avoid whitespace around commas, and the project should not remodel `User.role` as an enum, array, or join table while relying on the admin plugin's built-in role storage and permission checks.

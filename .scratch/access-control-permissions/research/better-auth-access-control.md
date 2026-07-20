# Better Auth access-control research

Question: exactly how this project should define Better Auth roles/scopes and perform permission checks using installed `better-auth@1.6.23`.

## Sources checked

- Installed package: `node_modules/better-auth/package.json` reports version `1.6.23`.
- Installed declarations/runtime: `node_modules/better-auth/dist/plugins/access/*`, `node_modules/better-auth/dist/plugins/admin/*`.
- Official docs: Better Auth Admin plugin, v1.6 latest, <https://better-auth.com/docs/plugins/admin>.
- Project config: `src/core/auth/auth-options.ts`, `src/core/auth/auth-client.ts`, `src/prisma/schema/auth.prisma`.

## Findings

This project is using the global Better Auth admin plugin, not the organization plugin. Server auth config currently calls `admin()` with no access-control options, and client auth config calls `adminClient()` with no options. The Prisma `User.role` column is `String?`, matching the admin plugin schema field.

Better Auth's admin access-control model is static, code-defined RBAC. Define a statement object whose keys are resource names and whose values are allowed action names, then call `createAccessControl(statement)`. The installed type signature is `createAccessControl<const TStatements extends Statements>(s: TStatements)` and returns `{ statements, newRole(...) }`. Roles should be created from that access controller via `ac.newRole(...)`; the standalone `role(...)` helper also exists, but `ac.newRole(...)` is the typed path that constrains role resources and actions to the statement object. Sources: `node_modules/better-auth/dist/plugins/access/access.d.mts:11`, `node_modules/better-auth/dist/plugins/access/access.d.mts:12`, `node_modules/better-auth/dist/plugins/access/types.d.mts:8`, `node_modules/better-auth/dist/plugins/access/types.d.mts:11`, `node_modules/better-auth/dist/plugins/access/types.d.mts:15`; official docs lines 639-680.

Use `as const` on the statement object. The official docs explicitly call this out for TypeScript inference, and the installed declarations use `const` generics plus literal tuple/array types to infer permitted resources and actions. Source: official docs lines 641-655; installed declarations at `node_modules/better-auth/dist/plugins/access/access.d.mts:12` and `node_modules/better-auth/dist/plugins/access/types.d.mts:15`.

For this project, the future permission module should export one shared, client-safe set of `statement`, `ac`, and named roles. Pass the same `ac` and `roles` object to both server `admin({ ac, roles })` and client `adminClient({ ac, roles })`. Better Auth documents that both sides need the access controller and roles, and the installed client declaration infers client permission and role types from `adminClient` options. Sources: official docs lines 698-738; `node_modules/better-auth/dist/plugins/admin/types.d.mts:58`, `node_modules/better-auth/dist/plugins/admin/types.d.mts:62`, `node_modules/better-auth/dist/plugins/admin/client.d.mts:8`, `node_modules/better-auth/dist/plugins/admin/client.d.mts:27`.

If overriding existing `admin` or `user` roles, predefined permissions are replaced, not merged automatically. To extend defaults, import and merge `defaultStatements` and existing role statements such as `adminAc.statements` from `better-auth/plugins/admin/access`. Better Auth docs state this, and the installed defaults are `user` and `session` resources with default `admin` and empty `user` roles. Sources: official docs lines 681-697; `node_modules/better-auth/dist/plugins/admin/access/statement.mjs:3`, `node_modules/better-auth/dist/plugins/admin/access/statement.mjs:23`, `node_modules/better-auth/dist/plugins/admin/access/statement.mjs:47`.

`admin()` options relevant here:

- `defaultRole?: string`, default `"user"`. New users get this role through the admin plugin database hook unless user data overrides it. Sources: `node_modules/better-auth/dist/plugins/admin/types.d.mts:17`, `node_modules/better-auth/dist/plugins/admin/admin.mjs:14`, `node_modules/better-auth/dist/plugins/admin/admin.mjs:26`.
- `adminRoles?: string | string[]`, default `["admin"]`. A role not in `adminRoles` is not considered an admin for admin operations even if it has permissions. Custom `adminRoles` are validated against configured `roles`. Sources: `node_modules/better-auth/dist/plugins/admin/types.d.mts:24`, `node_modules/better-auth/dist/plugins/admin/admin.mjs:15`, `node_modules/better-auth/dist/plugins/admin/admin.mjs:18`; official docs lines 957-969.
- `ac?: AccessControl` and `roles?: Record<string, Role>` configure custom permissions. Sources: `node_modules/better-auth/dist/plugins/admin/types.d.mts:55`, `node_modules/better-auth/dist/plugins/admin/types.d.mts:60`.
- `adminUserIds?: string[]` grants all admin operations independent of role checks. Sources: `node_modules/better-auth/dist/plugins/admin/types.d.mts:64`, `node_modules/better-auth/dist/plugins/admin/has-permission.mjs:4`; official docs lines 970-980.
- `allowImpersonatingAdmins` is deprecated; grant `user: ["impersonate-admins"]` instead. Sources: `node_modules/better-auth/dist/plugins/admin/types.d.mts:75`; official docs lines 567-575.

Permission checks:

- Client check of the current user: `authClient.admin.hasPermission({ permissions: { resource: ["action"] } })` calls `POST /admin/has-permission` and returns `{ success: boolean }`. Official docs show both `permission` and `permissions`, but installed runtime requires `ctx.body.permissions`, so use `permissions` consistently. Sources: official docs lines 741-800; `node_modules/better-auth/dist/plugins/admin/routes.mjs:838`, `node_modules/better-auth/dist/plugins/admin/routes.mjs:887`.
- Server check through the Better Auth API: `auth.api.userHasPermission({ body: { userId, permissions } })` or `auth.api.userHasPermission({ body: { role, permissions } })`. If called in a request context with headers/session, it can use the session user; otherwise it requires `userId` or `role`. Sources: official docs lines 801-833; `node_modules/better-auth/dist/plugins/admin/routes.mjs:845`, `node_modules/better-auth/dist/plugins/admin/routes.mjs:888`.
- Client-side role-only check: `authClient.admin.checkRolePermission({ role, permissions })` is synchronous and does not check the logged-in user. It checks the locally configured role definitions only. Sources: official docs lines 835-855; `node_modules/better-auth/dist/plugins/admin/client.d.mts:25`, `node_modules/better-auth/dist/plugins/admin/client.mjs:17`.
- Direct role objects also expose `role.authorize(request, connector?)`. The default connector is `"AND"`; resource-level requested actions can use `{ actions, connector: "OR" | "AND" }`. Sources: `node_modules/better-auth/dist/plugins/access/access.mjs:45`, `node_modules/better-auth/dist/plugins/access/access.mjs:46`, `node_modules/better-auth/dist/plugins/access/types.d.mts:15`.

Multi-role behavior is comma-separated string based. Admin docs state multiple roles are stored as a comma-separated string. Installed `setRole` accepts `string | string[]`, converts arrays with `roles.join(",")`, and stores that string in `User.role`. Installed `hasPermission` reads `(role || defaultRole || "user").split(",")` and grants if any listed role authorizes the requested permissions. Impersonation protection similarly splits the target user's role string and compares each role to `adminRoles`. Sources: official docs lines 625, 107-109; `node_modules/better-auth/dist/plugins/admin/routes.mjs:21`, `node_modules/better-auth/dist/plugins/admin/routes.mjs:24`, `node_modules/better-auth/dist/plugins/admin/routes.mjs:76`, `node_modules/better-auth/dist/plugins/admin/has-permission.mjs:6`, `node_modules/better-auth/dist/plugins/admin/has-permission.mjs:8`, `node_modules/better-auth/dist/plugins/admin/routes.mjs:576`.

Type inference constraints:

- Server-side admin role inference is based on the keys of the `roles` option. If no custom roles are passed, `InferAdminRolesFromOption` is `"user" | "admin"`. Source: `node_modules/better-auth/dist/plugins/admin/types.d.mts:84`.
- Client-side `checkRolePermission` role type is inferred from `adminClient({ roles })`; if no roles are passed, it falls back to `"admin" | "user"`. Permissions are inferred from `adminClient({ ac })`; if no access controller is passed, it falls back to default admin resources. Source: `node_modules/better-auth/dist/plugins/admin/client.d.mts:27`, `node_modules/better-auth/dist/plugins/admin/client.d.mts:30`.
- Therefore the project should keep the permission definitions in one shared module and import the exact exported `ac` and `roles` object into both auth option files. Do not reconstruct or widen the roles object separately, or the client will lose the literal role/action inference.

## Constraints for the existing Prisma `User.role`

The existing schema is compatible with Better Auth admin roles because the installed admin plugin declares `user.role` as an optional string and the project has `role String?`. Better Auth intentionally stores multiple roles in this one string as comma-separated values. That means the project should not change `User.role` to a Prisma enum, string array, or join table for Better Auth admin roles unless it also stops relying on the admin plugin's built-in role storage and checks.

Practical constraints:

- Role names should not contain commas, because Better Auth splits on comma.
- Normalize configured role names and stored values without whitespace around commas. Better Auth does not trim roles in `hasPermission`; a stored value like `"admin, editor"` would check `" editor"` and fail unless such a role key existed.
- When using custom `roles`, `setRole` rejects roles not present in the configured roles object. Source: `node_modules/better-auth/dist/plugins/admin/routes.mjs:70`.
- A nullable role falls back to `defaultRole` or `"user"` in permission checks. Source: `node_modules/better-auth/dist/plugins/admin/has-permission.mjs:6`.

## Recommendation

Define project permissions as a small, client-safe module later, roughly:

```ts
import { createAccessControl } from "better-auth/plugins/access"

export const statement = {
  // resource: ["action", ...],
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({ /* least privilege */ })
export const admin = ac.newRole({ /* admin workflow permissions */ })

export const roles = { user, admin }
```

Then wire it into `admin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] })` and `adminClient({ ac, roles })`. Use server-side `auth.api.userHasPermission` or direct role/session checks for enforcement, and reserve `authClient.admin.hasPermission` or `checkRolePermission` for UI affordances only.

# Auth and permissions

This directory owns Better Auth configuration and the app's global permission system.

## Permission model

The v1 model has two global Access Roles:

- `user`: an ordinary authenticated Auth User with no organization-management permissions.
- `admin`: an administrator with every configured organization-management permission.

App permissions use five Permission Resources:

- `member`
- `group`
- `groupMembership`
- `position`
- `positionAssignment`

Each resource supports `read`, `create`, `update`, and `delete`. These app resources are separate from Better Auth's native `user` and `session` resources, which retain Better Auth's action vocabulary.

All v1 permissions are global. Groups, Positions, Members, Group Memberships, and Position Assignments are choir-domain data, not permission scopes or Access Roles.

## Configuration

[`permissions.ts`](./permissions.ts) is the single source of truth. It exports:

- the role, resource, action, and scope vocabulary;
- the shared Better Auth access-control instance;
- the `user` and `admin` role definitions;
- `adminPluginOptions`, used by both Better Auth environments.

The server wires the shared options into `admin()` in [`auth-options.ts`](./auth-options.ts). The browser client wires the same options into `adminClient()` in [`auth-client.ts`](./auth-client.ts). Do not define roles or permissions independently in either file; doing so can make server decisions and client permission types disagree.

### Add a global Permission Resource

1. Add its name to `PERMISSION_RESOURCES` in `permissions.ts`.
2. If it uses a different action vocabulary, model that explicitly instead of adding actions that do not apply to every existing app resource.
3. Add or update tests in `permissions.test.ts` and `auth-options.test.ts`.
4. Protect the relevant feature write service with an enforcing helper.

The current statement builder grants every listed app action to `admin` and none to `user`. If a future role needs a different grant set, define that role alongside `accessRoles` and add it to `ACCESS_ROLES` and `adminPluginOptions.roles`.

Better Auth stores multiple Access Roles in the existing nullable role string as comma-separated values, for example `user,admin`. Do not remodel this field as an enum, array, or choir-domain relationship while the admin plugin owns role behavior.

## Server-side checks

Import server checks directly from `@/core/auth/permissions.server`:

```ts
import { canCurrentUser, requireCurrentUserPermission } from '@/core/auth/permissions.server'

const mayEdit = await canCurrentUser({ resource: 'group', action: 'update' })

await requireCurrentUserPermission({
  resource: 'group',
  action: 'update',
})
```

Use boolean helpers only for non-authoritative affordances such as deciding whether to render a control:

- `canCurrentUser({ resource, action })`
- `userIsAdmin()`

Use enforcing helpers at authoritative server boundaries before privileged reads, mutations, or Better Auth admin operations:

- `requireCurrentUserPermission({ resource, action })`
- `requireAdmin()`

The helpers resolve the current Better Auth session from the request headers. Unauthenticated actors and authenticated actors without the required permission are both denied.

## Handling denial

Enforcing helpers throw `AuthorizationDeniedError`. Its `code` is `AUTHORIZATION_DENIED`, and its structured `context` records the actor state and failed requirement for future audit logging.

Keep this as an internal app signal. Translate it at the caller boundary:

- authenticated browser requests should become forbidden/403 behavior;
- unauthenticated browser page access should be handled by route policy and redirected to login;
- future APIs should distinguish unauthenticated `401` from authenticated-but-forbidden `403`.

Do not convert authorization denial into a normal form-validation error.

## Global-only boundary

Global helpers accept only `{ resource, action }`. They intentionally reject fields such as `memberId`, `groupId`, `positionId`, `groupMembershipId`, or `positionAssignmentId`.

Do not extend `GlobalPermissionRequest` with optional scope identifiers. Future scoped authority must use either:

- a narrow current-actor domain predicate;
- a named feature policy; or
- a separately designed scoped-permission API with an explicit scope model.

## Verification

After changing permissions, run:

```sh
bun test src/core/auth
bun x tsc --noEmit
bun run lint
```

The tests cover shared server/client configuration, role grants, comma-separated roles, unauthenticated behavior, enforcing denial, the global-only type boundary, and disabled public email/password registration.

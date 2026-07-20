# Decide bootstrap and migration

Type: grilling
Status: resolved
Blocked by: 01, 02, 04, 05, 07
Parent: ../map.md

## Question

How should the system migrate from today's authentication-only protection to role/scope-based access control without locking out existing users or weakening admin bootstrap?

Include the initial role assignments, `scripts/bootstrap-admin.ts`, seed/dev behavior, tests that prove admin-only workflows are protected, and rollout order across navigation, proxy/page checks, actions, and services.

## Answer

The migration should make Better Auth's global `admin` Access Role the only v1 admin authority, with no transitional compatibility path. The owner has confirmed they can access and promote admin users directly, so implementation may require `scripts/bootstrap-admin.ts` to be run before `/admin` route enforcement goes live in any existing environment. If no user has `admin`, admin-only routes and workflows may become inaccessible until that bootstrap command is run; that is an acceptable operational requirement, not a compatibility case to encode in product code.

Initial role assignments should be explicit and conservative:

- existing Auth Users keep their current role value unless deliberately promoted;
- newly created member accounts from organization management continue to receive `user`;
- synthetic/default auth users continue to receive `user`;
- admin users are created or promoted only by `scripts/bootstrap-admin.ts` or by an already-authorized admin workflow.

`scripts/bootstrap-admin.ts` should remain the bootstrap and recovery tool. It should be idempotent, normalize the configured email, validate the configured password for new-user creation, create missing bootstrap users with `role: "admin"`, and promote existing users by adding `admin` to the comma-separated Better Auth role string without removing other roles. Existing-user promotion should not reset the password. The script may directly update `User.role` for an existing user because this is an operational bootstrap path, but normal app workflows should use the shared permission/auth helpers where practical.

There is no separate seed script in the current repo. Dev and local environments should use `bun run admin:bootstrap` with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `ADMIN_NAME` when an admin account is needed. Test factories and fixtures should set role strings deliberately per test: plain users as `user`, admins as `admin` or `user,admin` only when multi-role behavior is under test.

The implementation rollout should proceed from stable shared definitions to enforcement:

1. Add the shared permission module and wire Better Auth `ac`/`roles` into both server and client admin plugins.
2. Add focused permission-helper tests for role parsing/check behavior and admin bootstrap script behavior, including existing-user promotion preserving existing non-empty roles.
3. Update navigation and route-policy tests for the decided route facts: anonymous users redirect to `/login`, authenticated non-admin users are forbidden from `/admin`, authenticated admins are allowed, and non-admin navigation hides admin links.
4. Update proxy to call `auth.api.getSession()` and enforce `/admin` with the resolved `admin` role fact.
5. Add service-level authorization checks to organization-management write services before privileged writes or Better Auth admin calls, then update service tests to prove unauthenticated/non-admin callers are rejected and admins are allowed.
6. Keep server actions as adapters; update action tests only where denial translation or coarse early checks are intentionally added.

This order avoids weakening bootstrap, gives a known admin path before route lock-down, and prevents a temporary state where the UI hides admin actions but services still accept direct calls.

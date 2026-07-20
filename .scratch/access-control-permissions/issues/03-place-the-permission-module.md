# Place the permission module

Type: grilling
Status: resolved
Blocked by: 01, 02
Parent: ../map.md

## Question

Where should the app-owned permission module live, what should it be called, and what interface should it expose so callers can evaluate access without knowing Better Auth internals?

Consider current ownership boundaries: `src/core/auth` owns Better Auth setup, `src/core/navigation` owns route policy, `src/features` owns product workflows, and `src/shared` should stay framework/domain neutral.

## Answer

The app-owned permission module should live under `src/core/auth/permissions`. Its name should be the app permission module, with imports reading as permission-specific auth infrastructure rather than navigation or feature policy.

This placement follows the ownership boundary: the module adapts Better Auth access-control primitives, is wired into both `src/core/auth/auth-options.ts` and `src/core/auth/auth-client.ts`, and exposes the app's authorization vocabulary without leaking Better Auth internals to route, action, service, or UI callers. `src/core/navigation` should consume the module for route policy decisions, but it should not own permission definitions. Product features should consume the module for enforcement, but they should not define global roles or shared permission resources. `src/shared` is the wrong home because the module is app/domain auth infrastructure, not framework-neutral shared utility code.

The interface should expose:

- shared Better Auth configuration exports: `statement`, `ac`, and `roles`, preserving literal types and importing the same objects into server and client auth plugin setup;
- typed permission vocabulary: app Access Role, Permission Resource, Permission Action, and permission request types derived from the statement where practical;
- server-side check helpers that hide Better Auth API shape, such as `can`, `requirePermission`, `canAdmin`, and `requireAdmin`;
- client/UI affordance helpers only where they remain clearly non-authoritative, using Better Auth client checks through the same shared configuration;
- no route-specific policy, feature workflow policy, navigation composition, or resource-scoped choir-domain predicates until later tickets decide those boundaries.

Callers should ask app-shaped questions through this module instead of passing Better Auth `auth.api.userHasPermission` bodies around. The module owns translation to Better Auth; callers own the context-specific policy question they are enforcing.

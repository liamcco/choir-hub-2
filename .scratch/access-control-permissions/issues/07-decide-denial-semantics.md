# Decide denial semantics

Type: grilling
Status: resolved
Blocked by: 03, 04, 05
Parent: ../map.md

## Question

What should happen when access is denied in each caller context?

Decide redirects versus 403/not-found responses, server-action return shapes, thrown errors, audit/logging expectations, and whether the permission module exposes boolean `can...` checks separately from throwing `require...` checks.

## Answer

CSK Choir Hub v1 should distinguish authentication denial from authorization denial by caller context.

For browser page and route access, unauthenticated users should be redirected to `/login`. Authenticated users who lack the required route role or permission should get a 403-style forbidden page/error, not a login redirect and not a not-found response. This is an internal app, so a forbidden response is clearer than hiding route existence.

For form-submitting server actions, authorization denial should not be modeled as a normal form-state validation error. The UI should not expose forms or submit affordances the current user cannot use, so a submitted unauthorized action indicates stale UI, tampering, or a broken authorization affordance. In that case, the action should let the denial interrupt/throw so the user sees the app's forbidden/error handling rather than an inline form message. Expected domain and validation errors may still use form-state messages and field errors.

For future API or route handlers that serve non-page clients, denial should be represented with HTTP status responses: missing or invalid session as `401`, authenticated-but-forbidden as `403`. These handlers should not redirect to `/login` and should not use form-state-shaped errors.

The permission module should expose both boolean and enforcing helpers:

- `can*` helpers, such as `canCurrentUser(...)` or `canAdmin()`, return booleans and are for UI affordances, conditional rendering, and other non-authoritative branching.
- `require*` helpers, such as `requireCurrentUserPermission(...)` or `requireAdmin()`, are the enforcement API. They either return useful authorized context or interrupt by throwing/triggering the framework denial behavior.

Denied service calls should use a distinguishable app-level authorization error type or equivalent internal signal. Next-facing adapters can translate that signal into `forbidden()` or a `403` response, while tests and future infrastructure can assert against the app-level type without depending on Better Auth internals.

Denied authorization attempts do not require full audit logging in the first access-control implementation because the repo does not yet have proper logging/audit infrastructure. The denial type and context should still be structured enough to support later audit logging. A separate v1 follow-up note records the future logger/audit requirement in [`features-to-be-implemented-for-v1.md`](../../features-to-be-implemented-for-v1.md).

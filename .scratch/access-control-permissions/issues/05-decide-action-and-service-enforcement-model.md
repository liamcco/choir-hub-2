# Decide action and service enforcement model

Type: grilling
Status: resolved
Blocked by: 01, 02, 03
Parent: ../map.md

## Question

Where should authorization be enforced for server actions and services, and what should callers pass into the permission module?

Resolve whether enforcement belongs in every server action before validation, inside feature write services, inside both with different responsibilities, or through a wrapper/context pattern. Include expected behavior for direct service calls in tests and future API route handlers.

## Answer

Feature write services are the authoritative authorization boundary for product mutations. Server actions and future route handlers are caller adapters: they parse transport-specific input, validate request/form shape, call the feature service, perform revalidation or response shaping, and translate known errors for their caller context. They may perform coarse early checks when useful for UX or request handling, but they must not be the only layer protecting a write.

The default write path should therefore be:

1. Server action or route handler validates caller input.
2. Feature write service calls the app permission module before mutating state or invoking privileged Better Auth admin APIs.
3. Feature write service performs the workflow mutation.
4. Caller adapter handles revalidation, redirects, HTTP response shape, or form-state translation.

The service-level check should use a small server-only permission helper, such as `permissions.requireCurrentUserPermission({ resource, action })`, rather than forcing every normal request-path caller to pass a bulky permission object. That helper owns reading the current request/session context and translating the app-shaped permission request into Better Auth checks. Better Auth details stay inside `src/core/auth/permissions`.

Direct service calls in tests, scripts, future API route handlers, or other non-UI callers should still pass through the same service authorization boundary. Tests for feature write services should explicitly arrange an authorized current actor, or assert that the service rejects when no authorized actor is available. Action tests can continue to focus on form parsing, service delegation, revalidation, and form error translation by mocking the service boundary.

Server actions should not normally duplicate the exact same resource/action permission check already enforced by the service. Duplicated checks are reserved for coarse early behavior, such as rejecting an unauthenticated request before expensive parsing or shaping a better caller-specific denial response. The service check remains authoritative.

Denial return shapes, redirect versus 403 behavior, and the exact throwing/boolean helper split are left to [Decide denial semantics](07-decide-denial-semantics.md). Resource-specific context beyond global v1 permissions is left to [Decide resource-scoped permissions](06-decide-resource-scoped-permissions.md).

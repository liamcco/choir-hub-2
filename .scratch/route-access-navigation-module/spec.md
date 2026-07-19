# Route Access Navigation Module

Status: ready-for-agent

## Problem Statement

Route access policy, Proxy redirects, post-login destination, and visible navigation are related parts of one user-facing routing concept, but callers still know route strings and redirect semantics directly. The existing access policy module already has useful depth, but the interface can be deepened so Proxy and navigation act as adapters over the same route-access vocabulary.

Without this, future route changes can require edits in several places: Proxy, login, navigation, page redirects, and tests.

## Solution

Deepen the route access/navigation module so it owns canonical route identifiers, route access decisions, post-login destinations, and navigation item selection. Proxy remains the request-time adapter. Navigation remains the render-time adapter. Login uses the same module for destination decisions.

The module should improve locality for route strings and route access semantics without becoming a broad routing framework.

## User Stories

1. As an anonymous visitor, I want unauthenticated protected routes to redirect consistently, so that access behavior is predictable.
2. As a non-admin User, I want admin routes to redirect to the organization read-only surface, so that I land somewhere useful.
3. As an admin, I want post-login navigation to take me to the right admin surface, so that I can start management work quickly.
4. As an authenticated Member, I want navigation to show only routes I can use, so that the app is not misleading.
5. As a future developer, I want route strings to have one maintained home, so that route changes do not spread across modules.
6. As a future developer, I want Proxy and navigation to share one policy vocabulary, so that request-time and render-time behavior stay aligned.
7. As a future developer, I want login destination behavior to use the same route access module, so that sign-in flow does not drift from navigation.
8. As a future developer, I want the interface to stay small, so that callers do not need to learn a routing framework.
9. As a maintainer, I want existing Proxy behavior to remain intact, so that route protection is not weakened.
10. As a maintainer, I want tests to cover route decisions and navigation decisions at the module seam, so that regressions are easy to spot.

## Implementation Decisions

- Keep the existing access policy module as the natural starting point.
- Add or clarify canonical route constants or route descriptors where they improve locality.
- Keep Proxy as the request-time adapter for top-level path/session redirects.
- Keep navigation as the render-time adapter for visible route links.
- Keep page-level route runner fallback redirects separate from Proxy behavior.
- Avoid introducing a broad adapter seam unless there are two real adapters with distinct behavior.
- Preserve current route URLs and navigation labels.
- Preserve the distinction between admin Members surface and other admin organization surfaces.

## Testing Decisions

- Extend existing access policy tests to cover any new route descriptors or destination helpers.
- Preserve Proxy tests as integration-style coverage for request-time route decisions.
- Preserve navigation tests as render-time coverage for visible links.
- Avoid testing duplicated route string details in every caller.

## Out of Scope

- Moving redirects out of Proxy.
- Replacing the admin route runner.
- Changing URLs or labels.
- Changing admin authorization rules.
- Changing Server Function authorization.
- Adding new roles or permissions.

## Further Notes

- This spec should be sequenced after or alongside route grouping only if the implementation stays narrow.
- The goal is locality for route knowledge, not a general-purpose router abstraction.


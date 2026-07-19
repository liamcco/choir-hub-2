# Deepen Admin Route Composition

Status: resolved

## Problem Statement

CSK Choir Hub is set up with a mostly healthy feature-oriented folder structure, but the admin route modules are shallow. Every admin page repeats the same route implementation recipe: load the current actor, decide whether the actor may access the admin surface, redirect unauthenticated or non-admin actors, build a workflow module runtime, load screen state, translate workflow authorization errors, and render the screen.

That repetition makes the page files less glancable and creates a growth risk. Each new admin surface will require future developers to remember the full recipe instead of using one deep module with a small interface. The current shape also makes the layout/proxy decision feel muddy: top-level request redirects already belong in Proxy, but page modules still contain enough redirect and authorization orchestration that the seam is not obvious.

## Solution

Deepen admin route composition behind one route runner module. Admin page modules should become thin App Router adapters that declare the admin surface, the workflow state loader, the workflow authorization error mapping, and the screen renderer. The route runner owns the repeated implementation: actor loading, admin access decisions, redirect mapping, workflow state loading, and fallback handling for workflow authorization errors.

Proxy remains the request-before-render seam for path/session route access. Layouts remain the seam for shared app chrome. Page modules remain the App Router seam for composing a single route, but they should no longer repeat the whole route bootstrap implementation.

This keeps the existing organizational domain modules intact: Group, Member, Group Membership, Position, Position Scope, Position Assignment, and Auth User behavior should not change.

## User Stories

1. As a future developer, I want admin page modules to be small and glancable, so that I can understand a route quickly.
2. As a future developer, I want one admin route runner interface, so that I do not have to remember the full route bootstrap recipe for every admin page.
3. As a future developer, I want adding a new admin route to require only route-specific declarations, so that admin surface growth stays cheap.
4. As a future developer, I want actor loading to concentrate in one route runner implementation, so that session-related changes do not spread across pages.
5. As a future developer, I want admin access decisions to concentrate in one route runner implementation, so that route authorization remains consistent.
6. As a future developer, I want admin page redirects to use the existing access policy vocabulary, so that Proxy, navigation, actions, and pages speak the same language.
7. As a future developer, I want workflow authorization errors to map consistently to redirects, so that stale actor or policy edge cases behave predictably.
8. As a future developer, I want the route runner to use a small interface, so that it has depth rather than becoming another shallow pass-through.
9. As a future developer, I want admin page tests to exercise route behavior through one high seam, so that tests do not duplicate implementation details across every page.
10. As a future developer, I want representative page tests to prove route-specific wiring, so that the route runner does not hide incorrect workflow selection.
11. As an admin, I want the Members route to keep loading the Member account management screen, so that account and Member administration still works.
12. As an admin, I want the Groups route to keep loading the Group management screen, so that Group hierarchy and Group Kind administration still works.
13. As an admin, I want the Group Memberships route to keep loading the Group Membership management screen, so that dated Member periods in Groups still work.
14. As an admin, I want the Positions route to keep loading the Position management screen, so that Position and Position Scope administration still works.
15. As an admin, I want the Position Assignments route to keep loading the Position Assignment management screen, so that dated Position holders still work.
16. As an admin, I want admin routes to continue redirecting unauthenticated visitors to login, so that administrative data is not exposed.
17. As an admin, I want admin routes to continue redirecting non-admin Users to the organization read-only surface, so that they can use the app without admin powers.
18. As a non-admin User, I want admin route protection to remain consistent, so that I do not see management screens I cannot use.
19. As a non-admin User, I want the organization read-only route to stay available, so that my access is not broken by admin route cleanup.
20. As an anonymous visitor, I want protected routes to redirect before rendering when possible, so that unauthenticated navigation remains fast and consistent.
21. As a future developer, I want Proxy to remain the top-level request redirect seam, so that path/session route access is not duplicated in layouts or pages.
22. As a future developer, I want layouts to remain focused on shared route UI, so that layout modules do not absorb authorization or workflow state loading.
23. As a future developer, I want page-level redirects to remain only as render-time defense, so that Server Function and workflow authorization remain robust.
24. As a future developer, I want the route runner to avoid a broad adapter seam unless a second real adapter exists, so that the module does not become speculative.
25. As a future developer, I want the implementation to preserve existing feature module locality, so that Group, Member, Group Membership, Position, and Position Assignment workflows stay in their current feature modules.
26. As a future developer, I want no domain schema changes, so that this refactor does not disturb the organizational model.
27. As a future developer, I want no change to Auth User or Member semantics, so that the separation between auth identity and choir Member remains intact.
28. As a future developer, I want no change to Server Function authorization checks, so that writes remain protected even if Proxy matcher coverage changes later.
29. As a future developer, I want route files to be boring declarations, so that code review can spot accidental route-specific behavior.
30. As a future developer, I want the route runner to make the folder structure scale, so that future admin modules do not make the app tree noisy.
31. As a maintainer, I want this refactor to respect the documented codebase structure, so that feature modules, shared modules, and route modules remain distinct.
32. As a maintainer, I want tests and lint to pass after the refactor, so that architecture cleanup does not trade clarity for regressions.

## Implementation Decisions

- Build or modify one admin route runner module with a small interface for rendering an admin workflow route.
- The route runner interface should accept the admin surface required by the route.
- The route runner interface should accept a route-specific loader that produces the screen state or screen input.
- The route runner interface should accept a route-specific renderer that turns loaded state into the route output.
- The route runner interface should support route-specific workflow authorization error mapping without requiring every page to repeat try/catch redirect code.
- The route runner implementation owns current actor loading for admin pages.
- The route runner implementation owns admin access decisions by using the existing access policy module.
- The route runner implementation owns redirect behavior for unauthenticated actors and authenticated actors who cannot access the admin surface.
- The route runner implementation should not replace Proxy. Proxy remains the request-time adapter for top-level path/session route access before rendering.
- The route runner implementation should not replace Server Function authorization. Server Functions continue to verify authorization through their existing workflow/action seams.
- Layout modules should not become authorization or workflow state-loading modules. Layouts remain for shared app chrome and persistent UI.
- Admin page modules should become thin App Router adapters. They should declare the route-specific surface, loader, renderer, and workflow authorization error behavior.
- Existing feature workflow modules remain the owners of Member account management, Group management, Group Membership management, Position management, and Position Assignment management.
- Existing runtime composition modules may continue to construct workflow modules. The route runner should call the route-specific runtime loader rather than knowing every workflow dependency itself.
- The route runner should not introduce a broad generic adapter interface unless there is a second real adapter. A single in-process implementation is enough.
- Do not change the organizational Prisma schema.
- Do not change Auth User, Member, Group, Group Membership, Position, Position Scope, or Position Assignment domain semantics.
- Do not change route URLs or visible navigation labels as part of this refactor.
- Keep the implementation compatible with the current Next.js App Router behavior and the repository's Next.js canary documentation.

## Testing Decisions

- Test through the highest useful seam: the admin route runner interface.
- Good tests should assert route behavior, redirect outcomes, and rendered route output without reaching into the route runner implementation details.
- Add focused tests for the route runner module using fake actor loading, fake access outcomes if needed through existing policy behavior, fake loaders, fake renderers, and fake workflow authorization errors.
- Keep or add representative page-level tests only where they prove route-specific wiring, not the route runner recipe repeated five times.
- Preserve existing access policy tests as prior art for role parsing, admin access decisions, post-login destination behavior, and route access decisions.
- Preserve existing Proxy tests as prior art for request-before-render route protection.
- Preserve existing screen tests for admin feature screens; this refactor should not retest screen internals through page modules.
- Preserve existing action tests for Server Function authorization; Proxy and route runner coverage must not be treated as sufficient write authorization.
- Verification should include the configured test suite and lint/type checks used by this repo.

## Out of Scope

- Moving top-level request redirects out of Proxy.
- Turning layouts into authorization or workflow state modules.
- Reorganizing the full folder structure beyond the route composition modules needed for this spec.
- Refactoring dated-period presentation, admin action helpers, or large screen modules.
- Changing navigation labels, route URLs, or product behavior.
- Changing Auth User, Member, Group, Group Membership, Position, Position Scope, or Position Assignment semantics.
- Changing Prisma schema files or generated Prisma client output.
- Adding new admin product surfaces.
- Changing public login behavior beyond preserving existing redirect behavior.

## Further Notes

- The architecture review concluded that the folder structure is directionally right for growth: feature modules mostly have locality, and route files are the main shallow spot.
- The key distinction is seam placement. Proxy is the request-before-render adapter for top-level redirects, layouts are shared UI modules, and the new route runner is the page-render composition module.
- This spec intentionally keeps the first implementation narrow. Route groups for authenticated/admin app chrome and deeper dated-period presentation remain good follow-up candidates, but they should not be bundled into this change.
- Proposed test seam for confirmation: one admin route runner interface, plus representative route adapter coverage where necessary.

## Confirmed Decisions

- Use one small generic route runner interface for admin pages.
- Keep the route runner interface to route-specific declarations: required admin surface, state loader, screen renderer, and workflow authorization error predicate.
- Place the route runner with admin shell/access modules, not inside an individual workflow module and not inside the App Router tree.
- Keep workflow authorization error predicates route-specific so the route runner does not import every workflow module's error class.
- Map workflow authorization errors to the organization read-only route, matching the current admin page behavior.
- Test repeated route behavior at the route runner interface and keep page-level route tests minimal and representative.

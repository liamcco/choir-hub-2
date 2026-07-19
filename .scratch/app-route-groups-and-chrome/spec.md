# App Route Groups And Chrome

Status: resolved

## Problem Statement

CSK Choir Hub currently renders app navigation from the root layout, so public login and authenticated application routes share the same app chrome seam. That works while the route tree is small, but it makes the layout module broader than it needs to be and blurs the distinction between public routes, authenticated member routes, and admin routes.

As the platform grows, layouts should help keep pages glancable by carrying shared route UI at the right depth. The current root layout should own global document and provider setup, while authenticated and admin route groups should own their route-specific chrome.

## Solution

Introduce App Router route groups for public and authenticated application surfaces. Keep the root layout focused on global document structure and providers. Move app navigation into the authenticated route group layout, with an optional nested admin route group layout only if it adds real depth.

The public login route should remain outside authenticated app chrome. Authenticated member routes should share navigation. Admin routes should continue to use the same route URLs and access policy behavior.

## User Stories

1. As an anonymous visitor, I want the login page to avoid authenticated app chrome, so that the public sign-in surface stays focused.
2. As an authenticated Member, I want organization and account pages to share consistent app navigation, so that moving through the app feels predictable.
3. As an admin, I want admin routes to keep the same navigation behavior, so that management workflows are not disrupted.
4. As a future developer, I want the root layout to stay small, so that global document/provider setup is easy to scan.
5. As a future developer, I want authenticated app chrome to live at the authenticated route seam, so that public and private UI do not leak into each other.
6. As a future developer, I want page modules to stay glancable, so that shared chrome does not get reintroduced into individual pages.
7. As a future developer, I want route groups to preserve current URLs, so that moving files does not change product behavior.
8. As a future developer, I want layouts to stay focused on shared UI, so that authorization and workflow state loading remain outside layout modules.
9. As a maintainer, I want route grouping to follow current Next.js conventions, so that the project remains compatible with the repo's canary Next.js version.
10. As a maintainer, I want tests to prove login and authenticated navigation still render correctly, so that layout movement does not cause regressions.

## Implementation Decisions

- Use Next.js route groups to separate public routes from authenticated application routes without changing URLs.
- Keep the root layout responsible for document structure, global providers, global CSS, and global toast rendering.
- Move app navigation into an authenticated route group layout.
- Keep login outside authenticated app chrome.
- Keep route URLs stable.
- Do not move authorization decisions into layouts.
- Do not change Proxy route protection as part of this spec.
- Introduce a nested admin layout only if it adds depth beyond the authenticated layout.
- Preserve existing navigation labels and access-policy-derived navigation behavior.

## Testing Decisions

- Test rendered login output to confirm authenticated navigation is absent.
- Test authenticated navigation through the existing navigation module seam.
- Add layout or route-level smoke coverage only where it proves the route grouping behavior.
- Preserve existing Proxy tests for route protection.
- Preserve existing screen tests for feature screens; this spec should not retest feature internals.

## Out of Scope

- Changing route URLs.
- Changing navigation labels.
- Changing admin route composition.
- Moving request-time redirects out of Proxy.
- Adding new admin surfaces.
- Changing product authorization rules.

## Further Notes

- This is a follow-up to the admin route composition work, not a prerequisite.
- Route groups should be introduced for locality, not as a substitute for the route runner module.


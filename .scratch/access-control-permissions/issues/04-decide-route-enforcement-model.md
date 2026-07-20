# Decide route enforcement model

Type: grilling
Status: resolved
Blocked by: 01, 02, 03
Parent: ../map.md

## Question

How should routes be protected across proxy checks, Server Component pages/layouts, navigation visibility, and public/authenticated/admin sections?

This should decide whether route access is role-based, permission-based, route-id based, prefix based, or a combination, and whether cached session-cookie checks are enough for any protected route or only for coarse redirects.

## Comments

2026-07-20: Claimed for wayfinder grilling. Current code uses proxy cached-session checks for every non-public path, exposes admin navigation to every authenticated user, and leaves admin Server Component pages/actions without authoritative permission gates. Pending human decision: whether admin routes should be hard-gated by the `admin` Access Role at Server Component render time, with proxy kept as authentication-only.

2026-07-20: Human direction: proxy should call `auth.api.getSession()` rather than only checking Better Auth's cached session cookie. Proxy should derive `isAdmin` and other session-related route facts from the resolved session.

2026-07-20: Human direction: route policy should use a combination of explicit route IDs and path-prefix classification. Named route IDs remain the canonical navigation and known-route vocabulary, while `/admin` prefix classification protects future admin URLs even before they are added to navigation.

2026-07-20: Human direction: `/admin` route access should start as role-based on the global `admin` Access Role. Route access should not be expressed as per-resource CRUD permissions in v1; finer permission checks belong in server actions, services, or data-loading policy decided by later tickets.

2026-07-20: Human direction: proxy is the route-level enforcement boundary. Server Component pages/layouts do not need to duplicate admin route checks solely for protection, though reusable server helpers may be used when a page/layout needs the resolved session or user facts anyway. Server actions and services still need independent enforcement because they can be invoked outside page rendering.

2026-07-20: Human direction: navigation should hide admin links from non-admin authenticated users rather than showing disabled or informational admin affordances.

## Answer

Route enforcement for v1 should use proxy as the route-level enforcement boundary and should evaluate the resolved Better Auth session with `auth.api.getSession()`, not only Better Auth's cached session cookie helper. The route-access input should include session-derived facts such as `isAuthenticated`, `isAdmin`, and any other session/user facts future route policy needs.

Route policy should combine explicit route IDs with prefix classification:

- named route IDs in `ROUTES` remain the canonical vocabulary for known routes, navigation, redirects, and tests;
- public routes, currently `/login`, stay explicitly listed;
- ordinary app routes require an authenticated session;
- every `/admin` path requires the global `admin` Access Role, including future admin URLs that may not yet be present in navigation.

Admin route access is role-based in v1. The route layer should not encode per-resource CRUD permissions such as `member:update` or `groupMembership:create`; those checks belong to the later action/service enforcement model and any future data-loading policy. This keeps URL access coarse and stable while preserving finer authorization for actual mutations and resource reads.

Server Component pages and layouts do not need to duplicate admin route checks solely as a protection mechanism when proxy has already enforced the route policy. They may use reusable server helpers when they need the resolved session or user facts for rendering. Server actions and services must still get independent authorization decisions later because they can be invoked outside route rendering.

Navigation visibility should mirror the same coarse route policy as a UI affordance: anonymous users see login navigation, authenticated non-admin users see member/account routes, and authenticated admins also see admin routes. Admin links should be hidden from non-admin users, not shown disabled.

The exact denied-access behavior, such as redirect target versus 403/not-found response, remains deferred to `Decide denial semantics`.

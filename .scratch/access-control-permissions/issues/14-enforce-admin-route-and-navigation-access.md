# 14 — Enforce admin route and navigation access

**What to build:** anonymous users still redirect to login, authenticated non-admin users are forbidden from `/admin`, admins are allowed, and admin navigation is hidden from non-admin users while visible to admins.

**Blocked by:** 12 — Add global permission foundation; 13 — Harden admin bootstrap

**Status:** resolved

- [x] Route policy distinguishes public, authenticated, and admin route access using explicit route IDs plus `/admin` prefix classification.
- [x] Proxy route enforcement evaluates resolved Better Auth session facts rather than only cached session-cookie presence.
- [x] Anonymous users are redirected to login for protected app routes.
- [x] Authenticated non-admin users are forbidden from `/admin` routes, including future `/admin` paths not present in navigation.
- [x] Authenticated admin users are allowed through `/admin` routes.
- [x] Navigation shows admin links to admins and hides them from authenticated non-admin users.
- [x] Route/navigation tests cover anonymous, authenticated non-admin, and admin behavior.

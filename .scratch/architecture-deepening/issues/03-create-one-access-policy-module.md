# 03 — Create one access policy module

**What to build:** Admin access decisions use one policy module across pages, server actions, route protection, and future navigation, so the app has one place to answer who may manage Members and other admin organizational surfaces.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Admin pages and server actions use the same access policy module for admin checks.
- [x] Route protection no longer bypasses its own logic, and uses the policy vocabulary where practical.
- [x] Role parsing and unauthenticated actor handling have one maintained home.
- [x] The dev login flow does not hard-code an admin-only destination in a way that conflicts with the policy.
- [x] Tests cover the policy interface and at least one representative route or action integration path.

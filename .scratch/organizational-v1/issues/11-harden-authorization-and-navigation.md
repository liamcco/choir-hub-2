# 11 — Harden authorization and navigation

**What to build:** Make admin-only writes, non-admin read-only access, and navigation consistent across the v1 organizational foundation.

**Blocked by:** 04 — Enable admin account and Member management; 05 — Build admin Group management; 06 — Build admin Group Membership management; 07 — Build admin Position and Position Scope management; 08 — Build admin Position Assignment management; 09 — Build non-admin organizational read-only experience; 10 — Build account self-service for non-admins.

**Status:** ready-for-agent

- [ ] Admin-only organizational write routes and actions are protected.
- [ ] Non-admins cannot create, update, delete, assign, or end organizational resources.
- [ ] Non-admins can access the intended read-only organizational views.
- [ ] Navigation exposes admin management surfaces only to admins.
- [ ] Navigation exposes organizational read-only surfaces to non-admin Users.
- [ ] Route protection reflects v1 admin and non-admin behavior.
- [ ] Authorization tests cover both direct requests and visible navigation/UI affordances.

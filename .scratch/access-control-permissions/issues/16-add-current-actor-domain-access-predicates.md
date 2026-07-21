# 16 — Add current-actor domain access predicates

**What to build:** the permission module exposes tested current-actor helpers for current Group Membership and current Position Assignment gates, keeping them separate from Better Auth roles/scopes and ready for future member-facing workflows.

**Blocked by:** 12 — Add global permission foundation

**Status:** resolved

- [x] Current Group Membership helpers derive the current Auth User and linked Member from request/session context.
- [x] Current Group Membership helpers answer whether the current Member belongs to the given Group at permission-check time.
- [x] Current Group Membership helpers do not accept `memberId`, do not accept an `at` input, do not include an admin override, and do not require Member Status to be active.
- [x] Current Position Assignment helpers derive the current Auth User and linked Member from request/session context.
- [x] Current Position Assignment helpers answer whether the current Member currently holds the given Position through an active Position Assignment.
- [x] Position Scope and Group Membership do not participate inside the current Position Assignment helper.
- [x] Tests prove allowed and denied behavior without treating Group Membership or Position Assignment as Better Auth Access Roles, Permission Scopes, or Permission Resource grants.

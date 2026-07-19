# 02 — Deepen Auth User backed Member account lifecycle

**What to build:** Admins can manage Auth User backed Member accounts through one lifecycle module that owns account creation, linked Member creation, rollback on Member creation failure, account access state, and the managed-account state shown to admins.

**Blocked by:** 01 — Introduce a narrow Member registry module.

**Status:** resolved

- [x] Creating a managed account still creates an Auth User and linked skeletal Member, and still removes the Auth User if Member creation fails.
- [x] Linked, unlinked, enabled, and disabled account states are represented by the lifecycle module rather than re-derived in the admin screen.
- [x] Account input normalization and auth role interpretation are kept behind the lifecycle module or its auth adapter seam.
- [x] Tests assert lifecycle outcomes through the module interface using the real Better Auth adapter shape and an in-memory test adapter.
- [x] The design continues to keep Auth User concerns separate from Member concerns.

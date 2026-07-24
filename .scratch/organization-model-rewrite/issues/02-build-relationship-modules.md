# 02 — Build relationship and effective-membership modules

**What to build:** Replace the shallow table-shaped organization write interface with deep modules for Home placement, explicit Committee membership, Position Assignment, and effective Group membership. Concentrate all cross-record invariants behind these interfaces.

**Blocked by:** 01 — Add explicit target schema and reference catalog.

**Status: complete**

- [x] Named domain modules exported from the organization feature entrypoint.
- [x] Home Placement owns Choir Membership and Section Placement writes.
- [x] Overlap, coverage, committee-only, eligibility, holder, and effective-membership rules are centralized.
- [x] Effective rosters deduplicate Users while retaining source information.
- [x] Current and historical Board membership is Position-derived.
- [x] Current actor group authorization uses Effective Group Membership.
- [x] Relationship mutation authorization vocabulary is explicit; structural writes are not part of the new modules.
- [x] Focused interface-level effective-membership coverage added.

Implementation note: PostgreSQL concurrency constraints and migration-level guarantees remain intentionally deferred to Issue 07, as specified by the rewrite delivery order.

# 01 — Add explicit target schema and reference catalog

**What to build:** Define the explicit Choir, Section, placement, flat Group Scope, and typed Position Scope persistence model, plus the validated code-controlled reference catalog. Current databases and rows are disposable.

**Blocked by:** None — can start immediately.

**Status:** complete

- [x] `organization.ts` exposes dedicated Choir, Section, Choir Membership, and Section Placement models.
- [x] Section persistence accepts only S1, S2, A1, A2, T1, T2, B1, and B2.
- [x] Group Kind contains only Committee and Board in the target model.
- [x] Group Scope represents exactly CSK-wide or one Choir and has no hierarchy.
- [x] Position Scope can reference CSK, one Choir, one Section, or one Group with real foreign keys and database-enforced target shape.
- [x] Dated models retain half-open period semantics and appropriate indexes.
- [x] The target persistence design identifies temporal non-overlap guarantees for Choir Membership per User, Section Placement per User, explicit Group Membership per User/Group, and Position Assignment per Position.
- [x] A pure catalog definition contains the exact Choir, Section, Group, Position, and Position Scope topology from ADR-0014.
- [x] Catalog validation proves unique stable IDs, valid cross-references, valid Group Scope, valid Position Scope, and Group-name uniqueness within Scope.
- [x] One idempotent foundation synchronization interface hides Drizzle upsert ordering and catalog validation.
- [x] The implementation is free to reset local databases and replace legacy development data; no backfill or identifier preservation is added.
- [x] Temporary implementation sequencing does not leak legacy Group concepts into the target module interfaces.
- [x] The demo seed is replaced with compatible Home placement and full fixed-catalog examples.
- [x] Required database guarantees that Drizzle cannot express are identified explicitly for inclusion in the final committed SQL migration in ticket 07.
- [x] Drizzle validation, generation, catalog tests, and foundation/demo synchronization pass against a disposable PostgreSQL database.

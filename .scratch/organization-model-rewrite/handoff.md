# Handoff: explicit organization model rewrite

## Next-session goal

Start with issue 01: define the explicit target schema and validated fixed reference catalog. Current databases and data are disposable; optimize for the sustainable V1 model.

## Read first

- `AGENTS.md`
- `CONTEXT.md`
- `docs/domain-model-notes.md`
- ADRs 0014–0024
- `docs/agents/issue-tracker.md`
- `docs/codebase-structure.md`
- `CONTRIBUTING.md`, especially Prisma schema and migrations
- `.scratch/organization-model-rewrite/spec.md`
- `.scratch/organization-model-rewrite/issues/01-add-explicit-schema-and-reference-catalog.md`

## Important context

- The admin management redesign is already implemented, but it is historical context rather than a compatibility target. Reuse only what improves the new design.
- Its generic Choir/Section Group model, hierarchy, structural mutation, and multiplicity semantics are the legacy behavior being replaced.
- Every current database is disposable development state. Do not build baseline, preflight, backfill, or preservation machinery.
- Finish with one clean initial migration from the final V1 schema. Any PostgreSQL behavior Prisma cannot express must be committed explicitly in that migration’s SQL.
- Prefer composable, feature-owned UI modules with meaningful interfaces. Do not preserve monolithic screens or introduce shallow generic wrappers.
- Do not implement deferred Song, Event, Project Ensemble, Audience, Voice Capability, or collaboration-space features as part of this rewrite.

## Intended module seams

- Reference Catalog
- Home Placement
- Committee Membership
- Position Assignment
- Effective Group Membership

These modules own invariants. Server actions and screen-shaped queries adapt their results but do not reproduce their rules.

## Delivery order

1. Explicit target schema and fixed reference catalog
2. Relationship and effective-membership modules
3. Composable organization-management UI
4. User Home placement management
5. Flat Group management
6. Fixed Position management
7. Legacy removal, clean initial migration, and V1 verification

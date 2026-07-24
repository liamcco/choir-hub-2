# 07 — Remove the legacy model and create the initial V1 migration

**What to build:** Remove every retired schema/code/UI path, generate one clean initial migration from the final V1 schema, add any required PostgreSQL-specific SQL, and verify the organization workflows as one coherent V1.

**Blocked by:** 04 — Rewrite User Home placement management; 05 — Rewrite flat Group management and effective rosters; 06 — Rewrite fixed Position management.

**Status:** ready-for-agent

- [ ] All production reads and writes use the new domain module interfaces and target schema.
- [ ] The generic CHOIR, SECTION, and PROJECT Group Kind paths are removed.
- [ ] Legacy Group parent columns, relations, indexes, tree modules, and hierarchy route are removed.
- [ ] Legacy generic Choir/Section Group Membership structures and compatibility code are removed.
- [ ] Mutable Group and Position actions, forms, dialogs, editors, permissions, and tests are removed.
- [ ] The shallow `organizationService` bag and retired table-shaped write modules are removed.
- [ ] Prisma generated output is regenerated and no retired model field remains in feature code.
- [ ] Foundation and demo seeds are idempotent against the final schema and no legacy demo data is translated.
- [ ] Any obsolete migration artifacts are removed and a clean initial migration is generated from the final V1 Prisma schema.
- [ ] The committed migration SQL includes deliberate PostgreSQL constraints, indexes, or target-shape checks that Prisma cannot express natively.
- [ ] The committed initial migration applies successfully to an empty disposable PostgreSQL database without `prisma db push`.
- [ ] Database-level tests prove temporal overlap and target-shape guarantees implemented in custom migration SQL.
- [ ] CONTRIBUTING documents fresh-database setup, foundation synchronization, and the rule that Prisma-unsupported database behavior belongs in committed migration SQL.
- [ ] Desktop and mobile browser verification covers User placement, Committee membership, Board roster, Position Assignment, search, detail navigation, Back, and Close.
- [ ] Authorization denial, audit logging, pending, validation, empty, and unexpected-error behavior remains useful in every changed workflow.
- [ ] `bun x prisma validate`, Prisma generation, migration deployment to an empty database, tests, lint, and production build all pass.
- [ ] No Song, Event, Project Ensemble, Audience, Voice Capability, or collaboration-space implementation is introduced by the cleanup.

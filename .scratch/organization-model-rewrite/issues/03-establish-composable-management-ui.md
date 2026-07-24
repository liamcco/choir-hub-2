# 03 — Establish the composable organization-management UI

**What to build:** Establish the screen composition and reusable feature UI modules for User, Group, and Position management without treating the current admin implementation as a compatibility target.

**Blocked by:** 02 — Build relationship and effective-membership modules.

**Status:** complete

- [x] User, Group, and Position routes remain thin and compose screens through feature entrypoints.
- [x] Screen-shaped query modules return domain-shaped read models rather than Prisma records.
- [x] Repeated organization-management concepts are implemented as feature-owned UI modules with small interfaces where doing so improves locality.
- [x] Candidate repeated concepts include reference summaries, current dated relationships, relationship history, eligible-user selection, mutation feedback, and responsive collection/detail navigation.
- [x] Distinct User, Group, and Position workflows are not forced through one generic configuration object.
- [x] One-off JSX is not extracted into shallow pass-through modules.
- [x] Reusable interactive UI accepts read models and action slots; it does not coordinate Prisma writes or reproduce domain invariants.
- [x] Client Component seams sit as low as practical; Server Components remain the default.
- [x] Existing shared UI primitives are reused where their interfaces fit, without preserving an unsuitable admin screen structure.
- [x] The composition works mobile-first and defines accessible pending, empty, validation, authorization-denied, and unexpected-error states.
- [x] Tests cover the shared user-visible behavior through the composed screen interfaces rather than snapshots of incidental markup.

# Codebase Structure

This guide records the structural preferences for CSK Choir Hub. Future changes should preserve these patterns unless a feature needs a deliberate exception, in which case record the reason in an ADR.

## Design Vocabulary

Use the `codebase-design` vocabulary when discussing structure:

- **Module**: anything with an interface and an implementation.
- **Interface**: everything callers must know to use a module correctly, including invariants and error modes.
- **Seam**: where a module's interface lives and where behavior can vary.
- **Adapter**: a concrete implementation that satisfies an interface at a seam.
- **Depth**: leverage at the interface; prefer small interfaces that hide meaningful behavior.
- **Locality**: changes should concentrate in one place rather than spreading across callers.

Avoid shallow pass-through modules. A module earns its place when deleting it would push complexity back into multiple callers.

## Feature Modules

Prefer feature-oriented modules for product behavior. A future feature should keep its domain logic, write operations, read helpers, tests, and feature-specific UI close together instead of scattering them by technical layer.

Use shared folders only for genuinely shared modules:

- `src/components/ui`: reusable design-system primitives and low-level controls.
- `src/lib`: small cross-cutting helpers with stable interfaces.
- `src/common`: environment and infrastructure utilities that are not feature-specific.
- `src/db`: database client and persistence infrastructure.

Do not promote code to shared space just because two files currently look similar. Promote only when the interface is stable and the shared module improves locality.

## Prisma Schema

Keep Prisma schema files split by ownership under `src/prisma/schema`.

- Auth-owned models stay in `auth.prisma`.
- Choir organization models stay in their own schema file.
- Future modules should add their own schema files, for example `events.prisma`, `attendance.prisma`, or `content.prisma`.
- Do not mix unrelated future module models into an existing schema file just because Prisma allows it.
- Generated Prisma client output in `src/prisma/generated` must not be hand-edited.

When a model decision is hard to reverse or surprising, record the decision in `docs/adr/`.

## Next.js And React

Keep route files thin. A `page.tsx`, `layout.tsx`, or route handler should compose modules; it should not become the main implementation of a feature.

For screens with real behavior, split along meaningful seams:

- route/page module: routing, loading the initial screen, and composing the screen
- screen module: page-level layout and workflow orchestration
- feature UI modules: reusable or locally composed UI sections
- server/write modules: mutations, validation, authorization, and persistence
- query/read modules: data loading shaped for the screen

Prefer small, named UI modules when they protect locality. Avoid splitting JSX mechanically into tiny fragments that do not reduce knowledge required by callers.

Server Components are the default. Use Client Components only for interaction, browser APIs, optimistic state, or controlled UI state. Put `"use client"` as low in the tree as practical.

## Reuse And Duplication

Avoid duplicate business rules, validation rules, Prisma query shapes, and UI interaction patterns. Extract a module when reuse creates a stable interface and reduces future edits.

Do not extract too early:

- Two similar call sites can stay duplicated while the concept is still unclear.
- Three or more similar call sites should trigger a design check.
- Cross-feature duplication should be reviewed with the deletion test before extracting.

## UI Quality

Design mobile-first and responsive from the first implementation pass. Screens should work well on narrow viewports before desktop refinements are added.

Prioritize existing shadcn/ui-style components from `src/components/ui` for common controls, layout primitives, dialogs, menus, tables, forms, feedback, and navigation. Add or adapt reusable UI primitives there when the pattern is genuinely shared; keep feature-specific compositions inside the feature module.

Prioritize fast perceived feedback:

- use pending states for mutations
- use optimistic updates when the rollback behavior is clear
- keep navigation and form interactions responsive
- avoid blocking the whole page when a smaller pending state is enough

Prefer composable, editable UI over one large TSX file. If changing a repeated visual or workflow pattern would require edits in several files, introduce or reuse a deeper UI module.

## Tests

Test through module interfaces. If a test needs to reach into implementation details, reconsider the module shape.

Prefer focused tests for domain logic, validation, and write behavior. UI tests should cover meaningful workflows and regressions rather than snapshots of incidental structure.

When adding a seam, only introduce an adapter abstraction when at least two adapters are real or imminent. One adapter usually means the seam is hypothetical.

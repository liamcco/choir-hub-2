# Handoff: prototype the admin layout redesign

## Next-session goal

Use a throwaway UI prototype to validate the agreed admin collection, detail-dialog, and Group hierarchy layouts. Focus on visual questions such as information density, dialog proportions, responsive behavior, and hierarchy readability. Do not treat prototype code as production code.

## Repository and state

- Repository: `/Users/liam/projects/csk/fresh`
- The repo is a Next.js application with version-specific agent instructions in `AGENTS.md`. Before writing production Next.js code, read the relevant guide under `node_modules/next/dist/docs/`.
- Domain language and decisions live in `CONTEXT.md` and `docs/adr/`.
- `CONTEXT.md` has an uncommitted glossary addition from the completed grilling session. Read it rather than restating the `Voice` definition here.
- `src/features/organization/overview/screen.tsx` was already modified outside this work. Preserve that user-owned change. The redesign explicitly leaves `/organization` out of scope.
- No production implementation of this redesign has started.

## Agreed product structure

### Navigation and scope

- Admin is resource-first with three primary destinations: Members, Groups, and Positions.
- `/admin` should eventually redirect to `/admin/members`.
- Remove the standalone Group Membership and Position Assignment navigation items and routes. No legacy redirects are needed.
- Leave `/organization` unchanged.
- This effort reorganizes existing capabilities. Do not add deletion, Member profile editing, or other new lifecycle behavior.

### Shared collection pattern

- Each collection has a page header, transient free-text search, a primary create action, and an unwrapped bordered table surface. Do not place the main table inside a Card.
- Search covers all displayed textual table content. It does not need URL state.
- Use deliberate default ordering; defer interactive column sorting.
- Tables are browse-first. Do not put edit, relationship, or destructive action columns in them.
- Selecting an entity opens its read-first detail.

### Members collection

- The collection is Member-centric, not Auth User/account-centric. Authentication access is subordinate information in Member detail.
- Columns: `Name | Choir | Voice | Status`.
- Choir shows all current Group Memberships whose Group Kind is Choir.
- Voice uses current Section memberships. Multiple current Voices are allowed, all must be displayed, and multiplicity should receive a subtle warning indicator.
- `Create member` preserves current behavior: create the Auth User and linked skeletal Member together.

### Groups collection and hierarchy

- Columns: `Name | Kind | Parent | Members`.
- The table's Members count means current direct Group Memberships only.
- A secondary `View hierarchy` header action opens a dedicated full page, not a modal.
- The hierarchy renders every Group as an indented tree and shows one accumulated, descendant-inclusive, deduplicated current-member count per Group. Do not distinguish direct and effective totals there.
- Hierarchy count controls: segmented `All | Active | Passive`, plus an independent `Include former` checkbox.
- Default: `All`, with `Include former` unchecked. `All` means active plus passive; checking the box adds former Members.
- Filtering changes counts but never hides zero-count Groups.
- Selecting a Group in the hierarchy opens its detail dialog over the hierarchy; closing or Back returns to the hierarchy.
- An individual Group detail shows and manages direct Group Memberships only.

### Positions collection

- Columns: `Name | Group scope | Current holder | Held since`.
- Held since comes from the current Position Assignment and is empty for a vacant Position.

## Agreed create and detail behavior

- Create and detail experiences are route-backed dialogs during in-app navigation.
- Directly loading or refreshing those URLs renders the same content as a standalone page.
- Dialogs are generously sized and centered on desktop, full-screen on small screens.
- Successful creation transitions directly to the new entity's read-first detail.
- Detail content uses one scrollable layout without internal tabs in v1.
- Entity fields open read-first; explicit `Edit` reveals editing for existing capabilities.
- Show current relationships directly. Put ended Group Memberships and Position Assignments in a collapsed `History` section; omit history when empty.
- Relationship controls expand inline in the current detail. Do not stack dialogs.
- Relationship management is symmetric: Group Memberships can be managed from Member or Group details; Position Assignments from Member or Position details.
- Related entity names navigate to the related route by replacing the visible dialog rather than stacking one. Browser Back returns to the previous entity.

## Code-structure preference

- Share only modules with stable repeated behavior: the collection frame, page-header actions, responsive route-dialog shell, and small search control.
- Keep Member, Group, and Position tables and detail compositions explicit within their feature modules.
- Do not create a schema-driven universal admin entity page, generic column configuration system, or universal relationship renderer.
- Prioritize files that are readable at a glance. Follow `docs/codebase-structure.md` and its codebase-design vocabulary.

## Current implementation references

- Current admin screens: `src/features/organization/management/{members,groups,positions,group-memberships,position-assignments}/screen.tsx`
- Current navigation and routes: `src/core/navigation/app-navigation.tsx`, `src/core/navigation/site.ts`
- Existing UI primitives: `src/shared/ui/dialog.tsx`, `src/shared/ui/table.tsx`, `src/shared/ui/card.tsx`
- Existing hierarchy logic: `src/features/organization/core/group-tree.ts`
- Relevant domain decisions: `docs/adr/0004-track-group-membership-history.md`, `docs/adr/0005-track-position-assignments-history.md`

## Prototype questions to answer

1. Can the four-column Member table display multiple Choirs or Voices without becoming noisy?
2. What desktop dialog width and section spacing allow read-first summaries, inline relationship forms, and collapsed history to coexist comfortably?
3. Does the hierarchy remain legible with several nesting depths, member counts, the status control, and zero-count Groups?
4. Does replacing one detail dialog with a related entity feel understandable without modal stacking?
5. Does the mobile full-screen form/detail treatment preserve an obvious close/back path and usable inline relationship controls?

Keep the prototype small and disposable. Use representative data including duplicate Position names, multiple Choir memberships, a Member with multiple Voices, a vacant Position, deep Group nesting, zero-count Groups, and historical relationships.

## Suggested skills

- `/prototype` — primary next skill; build a throwaway UI specifically to answer the visual questions above.
- `/browser:control-in-app-browser` — inspect and exercise the prototype in the in-app browser at desktop and mobile widths.
- `/handoff` — after the prototype, carry conclusions (not prototype code) back into a fresh continuation of the design thread.
- `/to-spec` — only after prototype conclusions are merged back and the design is stable enough to specify for production.
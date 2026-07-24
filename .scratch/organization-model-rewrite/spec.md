# Explicit organization model rewrite specification

Status: ready-for-agent

## Problem Statement

The implemented organization-management experience is built on a generic `Group` hierarchy. Choirs and Sections are `GroupKind` variants, Choir Membership and Section Placement are generic `GroupMembership` records, Position Scope can reference only Groups, and administrators can create or edit structural Groups and Positions.

That implementation predates the accepted model in `CONTEXT.md` and ADRs 0014–0024. The code now permits states the domain rejects, cannot express several accepted relationships directly, duplicates Board membership, and derives user-facing “Voice” data from the wrong concept.

The repository is still in development and every current database is disposable. The rewrite should optimize for a coherent, sustainable V1 schema rather than preserve the current schema, rows, identifiers, migration history, or demo data.

## Outcome

Rewrite the organization feature around explicit first-class Choir, Section, Group, Position, and dated relationship concepts. Reuse existing code or interaction patterns only when they remain the clearest building blocks; preserving the current admin implementation is not a goal.

After this effort:

- CSK is the application boundary and has no database Group record.
- MK, KK, and DK are fixed Choir records.
- The twelve accepted choir-specific Sections reference shared fine-grained Voice Types.
- Choir Membership, Section Placement, explicit Committee membership, and Position Assignment have distinct persistence and write behavior.
- Groups are fixed, flat Committee or Board records scoped either CSK-wide or to one Choir.
- Positions and Position Scopes are fixed reference data; admins manage only Assignments.
- Effective Group Membership is derived from explicit Committee memberships and Group-scoped Position Assignments.
- Admin screens use the accepted terminology and enforce the accepted invariants.
- Legacy hierarchy, structural mutation, and generic Choir/Section membership code is removed.

## Source of Truth

Implementation must follow:

- `CONTEXT.md`
- `docs/domain-model-notes.md`
- ADRs 0014–0024
- `docs/codebase-structure.md`
- `CONTRIBUTING.md`, especially its Prisma migration rules

The implemented `.scratch/admin-management-redesign/` effort remains historical context only. It does not constrain the new information architecture, UI composition, routes, or implementation. Where it conflicts with the domain sources above, this specification wins.

## In Scope

### Explicit reference models

Persist dedicated reference records for:

- Choir
- Section
- Group
- Position
- Position Scope

Use stable, code-controlled identifiers and an idempotent foundation synchronization routine. V1 has no create, delete, move, rename, description-edit, or scope-edit workflow for these records.

The code-controlled catalog must validate itself before writing:

- every identifier is unique;
- every Section belongs to one known Choir and uses one fine-grained Voice Type;
- every Group has exactly one valid Group Scope;
- Group names are unique within Group Scope;
- every Position Scope references a known target;
- fixed Position invariants match ADRs 0014, 0023, and 0024.

### Dated relationships

Persist dedicated dated records for:

- Choir Membership
- Section Placement
- explicit Committee Group Membership
- Position Assignment

All periods use the existing half-open interval convention: `startsAt` is inclusive and `endsAt` is exclusive.

The authoritative write modules must enforce:

- a User has at most one current or overlapping Choir Membership;
- a User has at most one current or overlapping Section Placement;
- a Section Placement is fully covered by a Choir Membership for that Section’s Choir;
- ending or transferring a Choir Membership cannot leave a mismatched Section Placement;
- explicit Group Membership is accepted only for Committee Groups;
- explicit periods for the same User and Committee do not overlap;
- one Position has at most one holder for any period;
- a Voice Parent holder has a covering Section Placement in at least one scoped Section;
- a choir-scoped Master of Concerts or Master of Gigs has a covering Choir Membership in that Choir;
- Conductors do not require Choir Membership;
- Choir- and Section-scoped Positions do not derive Choir Membership or Section Placement.

Use PostgreSQL constraints for referential integrity, target-shape checks, and temporal non-overlap where feasible. Keep application validation as the friendly error interface even when the database is the final concurrency guard.

### Effective Group Membership

Provide one read module that answers effective Group membership at a supplied date and across history.

Effective Group Membership is the union of:

- explicit dated Committee Group Membership; and
- Position Assignment intervals for Positions scoped to the Group.

Board membership is entirely Position-derived. Committee rosters may combine explicit and Position-derived membership. Deduplicate a User in current roster counts while retaining the source relationships needed to explain why the User belongs.

Current-actor Group predicates in `src/core/auth/permissions.server.ts` must use effective Group membership rather than querying only explicit `GroupMembership`.

### Admin management

The current admin UI may be replaced. Build the management experience from composable UI modules with small interfaces, using existing shared primitives where they are genuinely useful. Prefer coherent workflows over visual or structural compatibility with the implemented redesign.

#### Users

The collection columns are:

`Name | Home Choir | Section | Status`

Home Choir and Section are singular nullable values. Remove multiple-value rendering and warnings.

User detail separates:

- current Home placement;
- current explicit Committee memberships;
- current Position Assignments;
- account access; and
- typed relationship history.

Admins can:

- start, transfer, or end Home Choir;
- start, change, or end Section Placement within the matching Home Choir;
- start or end explicit Committee membership;
- start or end Position Assignments subject to eligibility rules.

#### Groups

The collection columns are:

`Name | Kind | Scope | Members`

Scope displays `CSK-wide` or the Choir name. Members is the deduplicated current effective roster count.

Remove:

- Group creation;
- Group metadata editing;
- parent display and editing;
- the Group hierarchy route and screen.

Committee detail shows:

- read-only reference information;
- effective current roster with explicit or Position-derived source labels;
- controls for explicit Committee memberships only; and
- explicit membership history.

Board detail shows:

- read-only reference information;
- the Position-derived current and historical roster; and
- no direct membership controls.

#### Positions

Provide Position collection and detail workflows, but do not preserve the current route or screen structure merely for compatibility. Position creation and metadata/scope editing are not part of V1.

Position detail shows read-only fixed scopes and manages only Position Assignments. Assignment forms must expose only eligible Users or clearly explain authoritative validation failures.

### UI composition

Treat the User, Group, and Position screens as compositions of feature-owned UI modules rather than variants of one monolithic admin screen.

Create reusable organization-management modules only where a stable concept repeats, such as:

- reference summaries;
- current dated relationships;
- relationship history;
- eligible-user selection;
- assignment or membership mutation feedback; and
- responsive collection/detail navigation.

Each module must hide meaningful presentation or workflow behavior behind a small interface. Do not extract one-off JSX fragments or force distinct domain workflows through a generic configuration object merely because their layouts look similar.

Keep screen-shaped reads close to their screens. Pass domain-shaped read models and action slots into interactive UI modules instead of exposing Prisma records or making reusable UI coordinate domain writes. Keep Client Component seams as low as practical.

### Authorization and audit

Update the global permission vocabulary and audit actions to match the remaining writes:

- Choir Membership mutation;
- Section Placement mutation;
- explicit Committee membership mutation;
- Position Assignment mutation.

Do not use Group, Position, Choir, or Section relationships as Better Auth Access Roles or global Permission Scopes.

Structural Group and Position mutation permissions and actions must disappear with the retired writes.

### Seeds and representative data

Foundation synchronization owns all fixed Choirs, Sections, Groups, Positions, and Position Scopes from ADR-0014.

Demo data must:

- assign each User a compatible Home Choir and Section;
- include nullable Home placement;
- include dated transfers and Section changes without overlap;
- include explicit Committee members;
- derive Board and Mastery membership from Position Assignments;
- include Voice Parents, Conductors, choir-scoped Masters, Party Mistress, and Tour Committee Treasurer;
- include vacancies and historical Assignments.

Do not preserve the current demo seed’s deliberately incompatible random Choir/Voice combinations.

## Module Design

Replace the shallow table-shaped `organizationService` bag with named deep modules exported through the organization feature entrypoint.

### Reference Catalog module

Its small interface exposes the validated fixed catalog and foundation synchronization. It hides catalog cross-reference validation, deterministic ordering, and Prisma upsert details.

### Home Placement module

Its interface records and ends Choir Membership and Section Placement while hiding:

- overlap detection;
- Choir/Section compatibility;
- cross-period coverage;
- transfer transactions;
- dependent Position Assignment validation; and
- persistence ordering.

Callers must not coordinate Choir Membership and Section Placement tables themselves.

### Committee Membership module

Its interface manages explicit Committee membership only. It rejects Board and non-Group targets and hides dated overlap behavior.

### Position Assignment module

Its interface manages dated holders and hides:

- single-holder validation;
- Voice Parent eligibility;
- choir-representative eligibility;
- Conductor exemption; and
- the effect of Group scopes on effective membership.

### Effective Group Membership module

Its interface answers current or historical rosters and membership predicates. It hides the union and deduplication of explicit membership with Position-derived membership.

Screen-shaped query modules may compose these interfaces but must not reproduce their invariants. Do not add ports or adapters merely to wrap the single Prisma implementation; test through the domain module interfaces and keep any test-only seams internal.

## Persistence Shape

The Prisma schema must make the accepted concepts visible rather than encoding them through `GroupKind`.

At minimum:

- `Choir` owns Sections and Choir Memberships.
- `Section` references its Choir and fine-grained Voice Type.
- `ChoirMembership` references User and Choir.
- `SectionPlacement` references User and Section.
- `GroupKind` contains only Committee and Board.
- `Group` has no parent relation and has a CSK-wide or Choir scope.
- `GroupMembership` represents explicit Committee membership only.
- `PositionScope` can target CSK, a Choir, a Section, or a Group with database-enforced target shape.
- `PositionAssignment` remains dated and references User and Position.

The implementation may use one typed Position Scope table or several target-specific join tables. Choose the shape that gives PostgreSQL real foreign keys and keeps the domain module interface small; do not use unchecked arbitrary target IDs.

Base Voice Types and combined categories such as SA and TB remain code vocabulary for future matching. Section persistence accepts only the eight fine-grained numbered Voice Types.

## Database reset and migration strategy

Treat all current databases as disposable development state.

- Do not build a baseline, preflight, backfill, dual-write path, compatibility layer, identifier-preservation path, backup procedure, or production cutover runbook.
- It is acceptable to reset the database repeatedly while the target schema is being developed.
- Delete or replace legacy demo data instead of translating it.
- Optimize the final Prisma schema and module interfaces for the accepted V1 model, not for incremental compatibility with the generic Group model.

The repository should finish with a clean initial migration generated from the final V1 Prisma schema. Review the generated SQL before committing it.

When a required PostgreSQL guarantee cannot be expressed by Prisma schema syntax—such as temporal exclusion constraints, partial indexes, or target-shape checks—implement it deliberately in the committed SQL migration. Prisma-level and application-level validation do not substitute for that migration SQL. Migration verification must apply the committed SQL to a fresh disposable PostgreSQL database.

## Verification

### Domain module tests

Test through the new module interfaces:

- valid and invalid Home placement transitions;
- gaps, adjacent periods, and rejected overlaps;
- Section/Choir coverage;
- Committee-only explicit membership;
- current and historical effective Group membership;
- deduplication when explicit and Position-derived membership overlap;
- Board membership history;
- Voice Parent eligibility;
- choir Master eligibility;
- Conductor exemption;
- single Position holder history.

Retire tests whose only purpose is the deleted Group hierarchy or structural mutation implementation.

### Migration tests

Apply the clean initial migration to an empty disposable PostgreSQL database and verify:

- every expected table, foreign key, index, and custom PostgreSQL constraint exists;
- the foundation catalog synchronizes successfully;
- invalid overlapping periods and invalid target shapes fail at the database layer where required; and
- the representative demo seed produces valid effective rosters.

### Screen tests

Keep permanent frontend tests high-level and user-visible:

- singular Home Choir and Section in the User collection;
- Home placement management and typed history;
- flat Group Scope and effective member counts;
- explicit versus Position-derived roster labels;
- no structural create/edit affordances;
- Position Assignment eligibility and history;
- removal of hierarchy navigation.

### Full verification

Run:

```sh
bun x prisma validate
bun run prisma:generate
bun test
bun run lint
bun run build
```

Also run focused browser verification for the changed User, Group, and Position workflows at desktop and mobile widths.

## Out of Scope

- Song, Arrangement, and Part persistence or UI
- Voice Capability and Voice Offer UI
- Event Voice, Event, attendance, gig, or rehearsal features
- Project Ensemble persistence or management
- content/resource Audience implementation
- arbitrary user-created collaboration spaces
- profile or contact fields
- changing Better Auth identity, Access Role, login, or account-access semantics
- editing fixed reference metadata
- deletion of Users or historical relationship records

## Delivery Issues

1. Add the explicit target schema and fixed reference catalog.
2. Build the relationship and effective-membership modules.
3. Establish the composable organization-management UI.
4. Build User Home placement management.
5. Build flat Group management and effective rosters.
6. Build fixed Position management and Assignment eligibility.
7. Remove the legacy model, create the clean initial migration, and verify V1.

Each issue must leave its own interface tested and must not duplicate invariants in screen actions or query adapters.

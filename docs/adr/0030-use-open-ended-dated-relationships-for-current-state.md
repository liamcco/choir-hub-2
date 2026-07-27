# Use open-ended dated relationships for current state

## Decision

CSK Choir Hub will represent the current state of every Dated Relationship—Choir Membership, Section Placement, Group Membership, and Position Assignment—with an open-ended period (`endsAt` is null). New relationships cannot start in the future or end in the future. Administrators may correct both dates retrospectively.

Read modules will expose current and historical relationships separately: `list()` returns active records and `listPrevious()` returns ended records. Point-in-time reads may retain an explicit date when historical reporting requires them. Effective Group Membership applies the same split while continuing to derive membership from explicit Group Memberships and Position Assignments.

All relationship periods remain half-open: `startsAt` is inclusive and `endsAt` is exclusive. Existing non-overlap rules remain in force, and adjacent periods are valid.

## Rationale

Current administrative screens and authorization checks do not need to supply a date merely to ask for current relationships. Encoding current state as an open-ended period makes that query contract direct and removes request-time date plumbing from React screens. Retaining ended rows preserves historical reporting and retrospective correction without introducing scheduled relationship state.

## Consequences

- Current reads use the database meaning of `endsAt IS NULL`.
- Historical reads use ended rows and do not require a current timestamp.
- Validation rejects future starts and future ends for now.
- Scheduled relationship UI and data categorization are no longer part of the v1 workflow.
- Seed data must use only immediately active or historical relationship periods.

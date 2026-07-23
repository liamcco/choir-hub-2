# Domain Model Notes

This document tracks product and data-model concepts during the CSK Choir Hub domain-modeling session. Settled vocabulary belongs in `CONTEXT.md`; hard-to-reverse accepted decisions belong in `docs/adr/`.

## Organizational Foundation

- `Group` represents durable choir structure, such as the choir, voice sections, committees, board-like bodies, project groups, and similar standing organizational units.
- `Group.name` is unique among sibling Groups under the same parent, not globally unique.
- `GroupKind` is constrained for v1 rather than user-defined: choir, section, committee, board, and project.
- `User` is the unified Better Auth identity and choir person; every User has a `MemberStatus`.
- Choir profile and contact fields are deferred until concrete workflows need them.
- `MemberStatus` describes a User's overall choir relationship as active, passive, or former, independent of how many choirs or Groups they belong to.
- `GroupMembership` tracks historical group membership with `startsAt` and optional `endsAt`; there is no separate status concept for a Group Membership.
- `Position` represents a durable office or role that may be scoped to multiple Groups.
- `Position.name` is display text, not a globally unique domain key; distinct scoped Positions may share the same name.
- `PositionScope` represents Position Scope: the Groups where a Position has standing relevance.
- `PositionAssignment` tracks historical holders of a Position. A Position can only be held by one User at a time.
- Group hierarchy is intentionally flexible in v1; admins are trusted to create sensible parent/child relationships without kind-based enforcement.
- Membership and assignment writes prevent overlaps. Membership periods must not overlap for the same User and Group, and assignment periods must not overlap for the same Position.

## Deferred Concepts

- `Event`: needed later for rehearsals, concerts, meetings, services, and other dated choir activities.
- `Attendance`: needed later to record User participation or absence for Events.
- `EventGroup` or equivalent targeting: needed later if Events are aimed at one or more Groups.
- Internal information: needed later for User-facing pages, documents, notices, or knowledge-base content.
- User profile/contact details: deferred until concrete directory, communication, or administration workflows define the fields.
- Permissions and visibility: needed later, but should not be collapsed into `Group` unless a concrete rule proves that a durable organizational Group is the right reference.
- Temporary or derived cohorts: needed later for attendance lists, filters, or operational subsets, but should not be modeled as `Group` unless they become durable organizational units.

## Unresolved Organizational Questions

- What behavior each `GroupKind` should imply in the product.
- Whether Position Assignment needs extra metadata, such as appointment source, notes, or handover date.
- Whether non-overlap invariants should eventually be enforced in PostgreSQL exclusion constraints, service logic, or both.
- Whether future choir-specific profile fields should live directly on User or in a separate supporting model.

# Groups

This first implementation phase is only concerned with modeling people, groups, memberships, and group nesting. Authorization and access control are explicitly out of scope for this phase. Accounts are provisioned by admins and there is no self-service signup. Any authenticated user may access the application; group data is being introduced only to establish the choir directory structure.

## Model

- `GroupKind`: controlled admin-managed list, e.g. choir, voice part, board, committee, project.
- `Group`: a choir group with kind, name, optional description, active flag, and optional parentGroupId.
- PersonGroupMembership: direct person membership connecting one Person to one Group, with an addedAt timestamp. Membership rows are deleted when a person leaves a group.
- Position: a named role within a specific Group, e.g. president, treasurer, chair, conductor, section leader, committee member, board member, or librarian.
- Positions belong to a specific Group and define the roles that may exist within that group.
- Position: optionally references the PersonGroupMembership currently holding the role.
- Position.personGroupMembershipId: nullable reference to the current holder's PersonGroupMembership.
- Position.heldSince: nullable timestamp recording when the current holder assumed the position.
- Position.updatedAt: timestamp recording when the position record was last changed.
- A position may have at most one current holder in v1.
- A position is vacant when personGroupMembershipId and heldSince are null.
- A person can only hold a position through an existing PersonGroupMembership, which means they must be a direct member of the group where the position exists.
- Holding a position never grants membership. Membership is a prerequisite for holding a position.
- Position.personGroupMembershipId must reference a membership belonging to the same group as the position.
- Groups form a tree through parentGroupId. A group may have one parent and many children.
- Some groups are container groups and do not allow direct memberships.
- Container groups are marked explicitly and direct membership creation must be rejected for those groups.

- Define effective membership:
  - Membership flows upward from child groups to parent groups.
  - Membership does not flow from parent groups to child groups.
  - Container groups derive their effective members from descendant groups.
  - Reject cycles in the group hierarchy.

- Model expected hierarchy:
  - Voice groups are hierarchical. Users are directly assigned only to leaf voice groups such as B1, B2, T1, T2, A1, A2, S1, and S2.
  - Aggregate voice groups such as Basses, Tenors, Altos, Sopranos, and larger voice groupings act as container groups.
  - Sub-choirs may contain both direct members and child committee groups.
  - Members of a committee are considered effective members of all ancestor groups in the hierarchy, including the parent sub-choir.
  - Choir-wide committees may exist independently of sub-choirs.

## Behavior

- Global Better Auth admins can manage groups, memberships, and group nesting.
- Effective membership is resolved by traversing parentGroupId relationships upward from a member's direct groups.
- Positions are managed per group.
- Assigning a person to a position sets Position.personGroupMembershipId and Position.heldSince.
- Assigning a position requires selecting one of that group's existing direct memberships.
- Vacant positions remain visible even when no person currently holds them.
- A position update is invalid if the referenced membership belongs to a different group than the position.
- Position.updatedAt changes whenever the position holder or position details change.
- No group-based authorization is enforced in this phase.
- Groups exist only as organizational data that will support future authorization work.

## Tests

- Group graph tests:
  - Direct membership works.
  - A position can exist without a current holder.
  - A position may have at most one current holder.
  - Position.heldSince records when the current holder assumed the position.
  - Position.personGroupMembershipId can only reference a membership from the same group as the position.
  - Position.updatedAt changes when the position holder or position details change.
  - A person who belongs to multiple groups can hold positions independently within each group.
  - Holding a position does not create membership in the group.
  - Removing a membership vacates any positions currently referencing that membership.
  - Child group membership grants effective membership in parent groups.
  - Effective membership resolves correctly through multiple levels of voice-group hierarchy.
  - Parent membership does not grant membership in child groups.
  - Deleted memberships are no longer considered effective memberships.
  - Direct membership creation is rejected for container groups.
  - Cycles in the group hierarchy are rejected.

## Assumptions

- This app will always serve one choir, so no org or tenant abstraction should be introduced.
- Group kinds are database rows, not Prisma enums. Standard kinds are seeded and mostly fixed, but new kinds may be added as part of domain evolution.
- Membership history is not preserved in v1; removing a member deletes the membership row.
- The group hierarchy is expected to be shallow (typically 3–4 levels deep).
- Effective membership is calculated from the hierarchy at read time; no closure table is maintained in v1.
- Voice-group aggregation is the primary use case for nested groups.
- Positions are first-class group data. Positions belong to groups and optionally reference the membership currently holding the role.
- Position tenure is tracked through Position.heldSince for the current holder.
- Position history may be added in a future phase, for example by introducing position history rows or by recording position references in future membership history data.
- Only the current holder of a position is modeled in v1; historical position holders are out of scope for now.
- PersonGroupMembership is unique on (personId, groupId).
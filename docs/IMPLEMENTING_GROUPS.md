# Groups and Memberships

This first implementation phase is only concerned with modeling people, groups, memberships, and group nesting. Authorization and access control are explicitly out of scope for this phase. Accounts are provisioned by admins and there is no self-service signup. Any authenticated user may access the application; group data is being introduced only to establish the choir directory structure.

## Model

- `GroupKind`: controlled admin-managed list, e.g. choir, voice part, board, committee, project.
- `Group`: a choir group with kind, name, optional description, active flag, and optional parentGroupId.
- PersonGroupMembership: direct person membership connecting one Person to one Group, with an addedAt timestamp. Membership rows are deleted when a person leaves a group.
- PersonGroupMembership is unique on (personId, groupId).
- Groups form a tree through parentGroupId. A group may have one parent and many children.
- Some groups are container groups and do not allow direct memberships.
- Some groups are container-only, while others may have both direct memberships and child groups.
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
- No group-based authorization is enforced in this phase.
- Groups exist only as organizational data that will support future authorization work.

## Tests

- Group graph tests:
  - Direct membership works.
  - Child group membership grants effective membership in parent groups.
  - Effective membership resolves correctly through multiple levels of voice-group hierarchy.
  - Parent membership does not grant membership in child groups.
  - Deleted memberships are no longer considered effective memberships.
  - Direct membership creation is rejected for container groups.
  - Cycles in the group hierarchy are rejected.


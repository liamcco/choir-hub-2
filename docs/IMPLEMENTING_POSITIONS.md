# Positions

## Model

- Position: a global named role within the choir, e.g. president, treasurer, chair, conductor, concert master, section leader, librarian, or committee member.
- Positions are first-class domain concepts and are modeled independently of groups and memberships.
- A Position may be associated with one or more Groups.
- A Position must be associated with at least one Group.
- Choir-wide or miscellaneous positions may be associated only with the CSK root group.
- PositionGroup: association connecting a Position to one or more Groups.
- PositionGroup is unique on (positionId, groupId).
- Position.currentHolderUserId: nullable reference to the User currently holding the position.
- Position.currentHolderUserId uses ON DELETE SET NULL semantics at the database level.
- Position.heldSince: nullable timestamp recording when the current holder assumed the position.
- Position.updatedAt: timestamp recording when the position record was last changed.
- The current holder is stored directly on Position for v1 rather than in a separate history/holding table.
- A position may have at most one current holder in v1. This is enforced by the Position.currentHolderUserId field and supporting application logic.
- A person may hold multiple positions simultaneously.
- A position is vacant when currentHolderUserId and heldSince are null.
- Position assignments and UserGroupMemberships are separate concepts and are managed independently.
- Holding a position does not create, modify, or remove UserGroupMembership rows.
- Group membership does not automatically grant or imply any position.

## Behavior

- Positions are managed globally rather than per group.
- Assigning a person to a position sets Position.currentHolderUserId and Position.heldSince.
- Application logic is responsible for preventing invalid position updates and preserving the one-current-holder invariant.
- Position holders are surfaced in all associated groups when querying group positions. This does not imply group membership.
- Assigning or removing a position never creates, updates, or deletes UserGroupMembership rows.
- Deleting a User automatically vacates all positions currently held by that person through ON DELETE SET NULL semantics on Position.currentHolderUserId.
- Membership and position assignment are independent administrative actions.
- Vacant positions remain visible even when no person currently holds them.
- Position.updatedAt changes whenever the position holder or position details change.

## Tests

- A position can exist without a current holder.
- A position may have at most one current holder.
- A person may hold multiple positions simultaneously.
- Application logic prevents assigning more than one current holder to the same position.
- Position.heldSince records when the current holder assumed the position.
- A position may be associated with multiple groups.
- Position holders are surfaced in all associated groups when querying group positions.
- Assigning a position does not create membership in any group.
- Removing a position does not remove any memberships.
- Removing a membership does not affect a person's positions.
- Deleting a User sets Position.currentHolderUserId to null for all positions currently held by that person.
- Position.updatedAt changes when the position holder or position details change.

## Assumptions

- This app will always serve one choir, so no org or tenant abstraction should be introduced.
- Group kinds are database rows, not Prisma enums. Standard kinds are seeded and mostly fixed, but new kinds may be added as part of domain evolution.
- Membership history is not preserved in v1; removing a member deletes the membership row.
- The group hierarchy is expected to be shallow (typically 3–4 levels deep).
- Effective membership is calculated from the hierarchy at read time; no closure table is maintained in v1.
- Voice-group aggregation is the primary use case for nested groups.

## Position Assumptions

- Positions are first-class choir-wide concepts and are not owned by a single group.
- Position names are unique within the choir.
- Positions may be associated with multiple groups through PositionGroup.
- Position tenure is tracked through Position.heldSince for the current holder.
- Position history may be added in a future phase by introducing a separate PositionHolding or PositionHistory table if the need arises.
- Only the current holder of a position is modeled in v1; historical position holders are out of scope for now.
- Keeping the current holder directly on Position is an intentional v1 simplification; the model can evolve later if historical tracking becomes important.
- Database-level ON DELETE SET NULL semantics are used to ensure positions become vacant when a holder is removed.
- Membership and position assignment are intentionally separate systems, even though they are often related in the real-world organization.


## Changelog

This document originally modeled positions as roles that belonged to exactly one group and were held through a UserGroupMembership.

The model was revised to better reflect the choir's organizational structure.

### Position ownership

- Positions are now global choir-wide concepts rather than being owned by a single group.
- A Position may be associated with multiple Groups through PositionGroup.
- Position names are unique across the choir.
- PositionGroup is unique on (positionId, groupId).

### Position holders

- Positions are now held directly by a User rather than through a UserGroupMembership.
- Position.currentHolderUserId replaces the previous membership-based holder reference.
- A person may hold multiple positions simultaneously.
- A position may have at most one current holder.
- Vacant positions are represented by a null currentHolderUserId and heldSince.

### Relationship to memberships

- Position assignment and group membership are intentionally separate systems.
- Holding a position does not create group membership.
- Removing a membership does not affect positions.
- Group membership does not imply any position.
- Position holders are surfaced when querying associated groups, but this does not imply membership in those groups.

### Deletion behavior

- Position.currentHolderUserId uses ON DELETE SET NULL semantics.
- Deleting a User automatically vacates all positions held by that person.

### Future evolution

- Position history is intentionally out of scope for v1.
- The current holder is stored directly on Position as a simplification.
- The model may later evolve to introduce PositionHolding or PositionHistory tables if historical tracking becomes necessary.
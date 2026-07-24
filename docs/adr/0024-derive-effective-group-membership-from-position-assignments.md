# Derive effective Group Membership from Position Assignments

CSK Choir Hub will treat a User as a member of every Group scoped by their Position for the duration of an active Position Assignment. Effective Group Membership is the union of explicit dated Group Memberships and these Position-derived intervals; it is computed rather than stored as a duplicate relationship.

This rule makes Position Assignment history answer questions such as “who was part of the Board during this period?” and also places choir-scoped Masters of Concerts and Gigs in their respective CSK-wide Masteries. Choir and Section Position Scopes express relevance only and never create Choir Membership or Section Placement.

This supersedes the Board-specific rule in [ADR-0022](./0022-derive-board-membership-from-position-assignments.md).

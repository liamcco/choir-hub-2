# Model Choirs and Sections explicitly

Choir and Section are first-class domain concepts rather than variants of Group. Choir Membership and Section Placement are dedicated dated relationships with their own invariants—at most one current relationship of each kind per User—while explicit Group Membership remains for Committees, Board membership may derive from Position Assignment, and singing projects use Project Ensembles; this makes permanent organizational placement explicit and keeps temporary singing flexibility out of generic membership.

Concurrent current Choir Memberships or Section Placements are intentionally not represented, even though rare real-world overlaps can occur. Transfers may use adjacent periods or leave a gap, and every active Section Placement must be covered by the matching Choir Membership for that Section's Choir.

The persistence design may still share infrastructure where useful, but it must preserve these distinct domain interfaces. This amends [ADR-0002](./0002-constrain-group-kinds-in-v1.md) and [ADR-0004](./0004-track-group-membership-history.md).

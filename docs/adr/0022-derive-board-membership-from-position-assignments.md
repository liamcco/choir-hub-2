# Derive Board Membership from Position Assignments

> Superseded by [ADR-0024](./0024-derive-effective-group-membership-from-position-assignments.md).

CSK Choir Hub will derive the current Board roster from active assignments to Board Positions rather than store separate Group Membership records for the same relationship. Every Board member holds a Board Position, so Position Assignment is the single source of truth for both office and Board Membership.

Board Audiences and rosters therefore resolve active Board Position Assignments directly. Committee membership remains a dated Group Membership because committee participation is not defined by holding a Position.

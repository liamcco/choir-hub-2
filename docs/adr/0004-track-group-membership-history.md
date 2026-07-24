# Track group membership history

> Amended by [ADR-0015](./0015-model-choirs-and-sections-explicitly.md): Choir Membership and Section Placement retain their own dated history rather than using Group Membership.

CSK Choir Hub will store group membership as dated history with `startsAt` and optional `endsAt`, rather than as a current-only member-to-group join. Choir membership changes over time, and events, attendance, and reports need to answer who belonged to a section or group on a specific date.

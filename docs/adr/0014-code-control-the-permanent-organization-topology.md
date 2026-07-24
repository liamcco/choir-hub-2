# Code-control the permanent organization topology

CSK Choir Hub will store permanent Choirs, Sections, Groups, and Positions as database-backed reference records with stable identifiers, while defining and synchronizing their structural topology from code. V1 administration will not create, delete, rearrange, rename, or edit metadata for these fixed records; it manages their dated relationships to Users instead.

CSK itself is the fixed organizational boundary of the application, not a Group record. MK, KK, DK, organization-wide committees, and other top-level units do not need a database parent merely to restate that they belong to CSK; whole-organization audiences derive from qualifying Users, while collective appearances derive their actual roster from event participation.

The permanent Section topology is exactly:

- MK: T1, T2, B1, B2
- KK: S1, S2, A1, A2, T1, T2, B1, B2
- DK: S1, S2, A1, A2

These are twelve distinct choir-specific Section records referencing the shared Voice Types.

The fixed Group catalog contains one CSK-wide Board and the CSK-wide Concert Mastery, Gig Mastery, Party Mastery, Web Mastery, Tour Committee, and Recruitment Committee. Each of MK, KK, and DK also has its own choir-scoped Concert Group, Party Group, and Rodd Group; all non-Board bodies use Group Kind Committee regardless of whether their displayed name ends in “Mastery,” “Committee,” or “Group.”

Position definitions and Position Scopes are likewise code-controlled. Administrators manage only Position Assignments.

The fixed Position catalog includes the CSK-wide Board offices President, Vice President, Treasurer, Secretary, Master of Parties, Master of Gigs, 1st Master of Concerts, and Master of PR, plus:

- one Conductor scoped to each Choir;
- one Master of Concerts scoped to each Choir and associated with Concert Mastery;
- one Master of Gigs scoped to each Choir and associated with Gig Mastery;
- Party Mistress, the vice Master of Parties, scoped only to Party Mastery; and
- Treasurer associated with the Tour Committee.

Repeated display names identify distinct Positions through their scopes.

Master of Parties has both Board and Party Mastery scopes. Party Mistress is a separate vice office with only Party Mastery scope.

Master of Gigs has Board and Gig Mastery scopes, and 1st Master of Concerts has Board and Concert Mastery scopes. Master of PR is Board-only: PR has no Mastery, and no Position is scoped to Web Mastery.

Voice Parent Positions are also fixed:

- MK has one Voice Parent Position for each of T1, T2, B1, and B2.
- DK has one Voice Parent Position for each of S1, S2, A1, and A2.
- KK has four Voice Parent Positions, respectively scoped to S1+S2, A1+A2, T1+T2, and B1+B2.

The KK structure deliberately uses one Position with two Section Scopes for each Voice family.

This supersedes [ADR-0007](./0007-keep-group-hierarchy-flexible-in-v1.md), whose premise that the organization hierarchy was not yet proven no longer holds.

# 02 — Build relationship and effective-membership modules

**What to build:** Replace the shallow table-shaped organization write interface with deep modules for Home placement, explicit Committee membership, Position Assignment, and effective Group membership. Concentrate all cross-record invariants behind these interfaces.

**Blocked by:** 01 — Add explicit target schema and reference catalog.

**Status:** ready-for-agent

- [ ] The organization feature entrypoint exports named domain modules instead of requiring callers to coordinate Prisma-shaped `organizationService` methods.
- [ ] The Home Placement module owns Choir Membership and Section Placement writes.
- [ ] Home placement writes reject overlapping Choir Memberships and Section Placements.
- [ ] Section Placement must be fully covered by the matching Choir Membership.
- [ ] Transfers and endings are transactional and cannot leave a mismatched Section Placement.
- [ ] Ending placement rejects any surviving Voice Parent or choir-representative Assignment whose eligibility would be broken.
- [ ] The Committee Membership module accepts only Committee Groups and owns explicit dated membership writes.
- [ ] The Position Assignment module owns single-holder history, Voice Parent eligibility, choir Master eligibility, and the Conductor exemption.
- [ ] The Effective Group Membership module unions explicit Committee membership with Group-scoped Position Assignment intervals.
- [ ] Effective rosters deduplicate Users while retaining source information for presentation and audit.
- [ ] Current and historical Board membership is entirely Position-derived.
- [ ] `canCurrentUserInGroup` and its enforcing counterpart use current Effective Group Membership.
- [ ] Authorization requirements and audit subjects use the accepted relationship vocabulary.
- [ ] Structural Group and Position mutation permissions are removed; relationship mutation permissions are explicit.
- [ ] Screen/query modules do not reproduce domain invariants.
- [ ] Tests exercise observable results through each new module interface, including every accepted success, rejection, and historical query rule.
- [ ] Obsolete shallow module tests are removed when equivalent interface-level coverage exists.

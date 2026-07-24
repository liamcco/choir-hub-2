# 04 — Rewrite User Home placement management

**What to build:** Build the User management experience around explicit Home Choir, Section Placement, Committee membership, and Position Assignment relationships using the composable management modules.

**Blocked by:** 03 — Establish the composable organization-management UI.

**Status:** ready-for-agent

- [ ] The User collection displays exactly `Name | Home Choir | Section | Status`.
- [ ] Home Choir and Section are singular nullable values.
- [ ] Multiple-value rendering, separators, and warning indicators are removed.
- [ ] Search matches the displayed Home Choir and Section labels and readable unassigned states.
- [ ] User detail presents current Home placement separately from Committee memberships and Position Assignments.
- [ ] Admins can start, transfer, or end Home Choir through the Home Placement module.
- [ ] Admins can start, change, or end Section Placement only within the matching Home Choir.
- [ ] Placement forms make valid Choir/Section combinations easy to choose without duplicating authoritative validation.
- [ ] User detail manages explicit Committee memberships but never direct Board membership.
- [ ] Position Assignment controls surface eligibility failures clearly.
- [ ] History distinguishes Choir Membership, Section Placement, explicit Committee membership, and Position Assignment.
- [ ] Existing account access and Member Status behavior remains unchanged.
- [ ] Successful mutations revalidate every affected User, Group, and Position read.
- [ ] Screen tests cover singular placement, nullable states, transfers, typed history, Committee membership, Assignment eligibility, and responsive detail behavior.

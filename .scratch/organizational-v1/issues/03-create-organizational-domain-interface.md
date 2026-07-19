# 03 — Create the organizational domain interface

**What to build:** Create a small domain-facing interface for organizational reads and writes so future admin and member screens can use one coherent seam for Groups, Members, Group Memberships, Positions, Position Scopes, and Position Assignments.

**Blocked by:** 02 — Stabilize the organizational Prisma model.

**Status:** resolved

- [x] The interface supports reading and writing Groups, Members, Group Memberships, Positions, Position Scopes, and Position Assignments.
- [x] Callers can work through the interface without knowing scattered persistence details.
- [x] The interface validates sibling Group name uniqueness.
- [x] The interface preserves the invariant that Group Membership periods do not overlap for the same Member and Group.
- [x] The interface preserves the invariant that Position Assignment periods do not overlap for the same Position.
- [x] Tests exercise behavior through this interface rather than implementation details.
- [x] Errors are specific enough for admin UI validation feedback.

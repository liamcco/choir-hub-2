# 01 — Introduce a narrow Member registry module

**What to build:** Admin Member account management can work through a small Member-focused module instead of learning the full organization module. The account-management workflow should still list managed accounts, create linked skeletal Members, and update Member Status, but tests and callers should only need the Member registry interface for Member behavior.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Admin Member account management depends on a narrow Member registry module for listing Members, creating skeletal Members, and updating Member Status.
- [x] Account-management tests fake only the Member registry behavior needed by the workflow, without implementing unrelated Group, Group Membership, Position, Position Scope, or Position Assignment methods.
- [x] Existing behavior for creating linked Members and updating Member Status is preserved.
- [x] The full organization module remains available for broader organizational workflows.

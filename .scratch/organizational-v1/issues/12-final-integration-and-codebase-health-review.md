# 12 — Final integration and codebase health review

**What to build:** Verify the full v1 organizational foundation end to end, run configured codebase health checks, and clean up structural issues introduced by the implementation slices.

**Blocked by:** 01 — Set up implementation guardrails; 02 — Stabilize the organizational Prisma model; 03 — Create the organizational domain interface; 04 — Enable admin account and Member management; 05 — Build admin Group management; 06 — Build admin Group Membership management; 07 — Build admin Position and Position Scope management; 08 — Build admin Position Assignment management; 09 — Build non-admin organizational read-only experience; 10 — Build account self-service for non-admins; 11 — Harden authorization and navigation.

**Status:** ready-for-agent

- [ ] Prisma format and generation pass.
- [ ] The full test suite for organizational v1 passes.
- [ ] Admin workflows are verified end to end.
- [ ] Non-admin login, password change, and read-only organizational views are verified end to end.
- [ ] Oversized TSX/TS files, duplicated business rules, and shallow pass-through modules introduced during implementation are cleaned up.
- [ ] The final implementation still matches the v1 spec and ADRs.

# 17 — Verify access-control rollout behavior

**What to build:** a final pass proves the complete access-control rollout is coherent: shared permission definitions are used consistently, service-level enforcement is in place across organization management, route/navigation behavior matches the spec, and the full test/lint suite passes.

**Blocked by:** 14 — Enforce admin route and navigation access; 15 — Protect organization management writes; 16 — Add current-actor domain access predicates

**Status:** ready-for-agent

- [ ] Shared permission definitions are the source used by Better Auth configuration, route/navigation policy, and feature write services.
- [ ] Organization management service-level enforcement is consistently present across Members, Groups, Group Memberships, Positions, and Position Assignments.
- [ ] Admin route and navigation behavior matches the access-control specification.
- [ ] Current-actor Group Membership and Position Assignment helpers remain separate from Better Auth roles/scopes and from organization-management admin authority.
- [ ] The full automated test suite passes.
- [ ] The lint/check command passes.
- [ ] Any implementation notes needed by future event, attendance, content, or scoped-permission work are reflected in code comments or tracker follow-ups only where they clarify a real boundary.

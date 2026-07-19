# 05 — Split organization around workflow modules

**What to build:** Organization callers can use workflow-shaped modules for Group structure, Member registry, Group Membership history, Position Scope, and Position Assignment history instead of one broad CRUD-shaped interface, while preserving the existing domain decisions in the ADRs.

**Blocked by:** 01 — Introduce a narrow Member registry module; 04 — Deepen dated history handling.

**Status:** ready-for-agent

- [ ] Group structure behavior is reachable through a workflow-shaped module that preserves flexible hierarchy and sibling-only Group name uniqueness.
- [ ] Group Membership history behavior is reachable through a workflow-shaped module that preserves dated membership history.
- [ ] Position Scope and Position Assignment history behavior are reachable through workflow-shaped modules that preserve scoped Positions and one-holder-at-a-time semantics.
- [ ] The broad persistence adapter may remain broad, but caller-facing organization interfaces are smaller and workflow-oriented.
- [ ] Tests verify the workflow modules through their interfaces without requiring unrelated organizational setup.

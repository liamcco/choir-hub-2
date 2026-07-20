# 01 — Deepen Group tree behavior

**What to build:** Group hierarchy behavior is exercised through one module interface for sorted tree building, Group path lookup, ancestor checks, and sibling-name comparison, while preserving flexible hierarchy from ADR-0007.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Group management and Organization overview use the same Group tree module for hierarchy presentation.
- [ ] Group path labels are produced through the Group tree module rather than rebuilt at call sites.
- [ ] Group parent validation uses the same ancestor-checking behavior as the tree module.
- [ ] Tests cover sorting, orphaned parents, cycle protection, path lookup, sibling-name comparison, and ancestor checks through the module interface.
- [ ] Existing Group management and Organization overview behavior remains unchanged for users.

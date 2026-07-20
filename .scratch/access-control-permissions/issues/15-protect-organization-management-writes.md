# 15 — Protect organization management writes

**What to build:** Member, Group, Group Membership, Position, and Position Assignment management mutations require admin permission at the feature write service boundary, while server actions remain thin adapters and domain concepts are not treated as Better Auth roles or scopes.

**Blocked by:** 12 — Add global permission foundation

**Status:** ready-for-agent

- [ ] Member/account management write services require admin permission before linked Member creation, Member Status updates, or account access enable/disable operations.
- [ ] Group management write services require admin permission before Group create/update operations.
- [ ] Group Membership management write services require admin permission before create/end operations.
- [ ] Position management write services require admin permission before Position create/update operations.
- [ ] Position Assignment management write services require admin permission before create/end operations.
- [ ] Unauthorized service calls reject before mutations or privileged Better Auth admin operations are performed.
- [ ] Authorized admin service calls still perform the expected organization-management workflow behavior.
- [ ] Server actions remain caller adapters focused on form parsing, service delegation, revalidation, and caller-specific error translation.
- [ ] Tests cover service-level denial and allowed admin behavior across the organization management write surface.

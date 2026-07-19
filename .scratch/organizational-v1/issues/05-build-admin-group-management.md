# 05 — Build admin Group management

**What to build:** Let admins create, edit, view, and organize Groups using fixed Group Kinds, flexible hierarchy, and sibling-only name uniqueness.

**Blocked by:** 03 — Create the organizational domain interface.

**Status:** resolved

- [x] Admins can create Groups with name, description, Group Kind, and optional parent Group.
- [x] Admins can edit Group name, description, Group Kind, and parent Group.
- [x] Admins can view Groups as an organizational hierarchy.
- [x] Group hierarchy remains flexible and does not enforce kind-based parent/child rules.
- [x] Duplicate sibling Group names are rejected with useful feedback.
- [x] The UI does not expose any Group container concept.
- [x] The UI prioritizes existing shadcn/ui-style components and is responsive.
- [x] Tests cover the admin Group workflow and validation behavior.

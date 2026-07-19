# 04 — Enable admin account and Member management

**What to build:** Let admins create and manage auth Users/accounts and linked skeletal Members with one overall Member Status, while keeping public self-registration unavailable.

**Blocked by:** 02 — Stabilize the organizational Prisma model; 03 — Create the organizational domain interface.

**Status:** ready-for-agent

- [x] Admins can create a User account for a person.
- [x] Admins can create and manage the linked Member for that User.
- [x] Admins can set and update Member Status.
- [x] Public self-registration remains disabled.
- [x] Admins can manage account access state using the existing auth capabilities.
- [x] Member stays skeletal; profile and contact fields are not added.
- [x] Non-admins cannot access account or Member management writes.
- [x] The UI prioritizes existing shadcn/ui-style components and is responsive.

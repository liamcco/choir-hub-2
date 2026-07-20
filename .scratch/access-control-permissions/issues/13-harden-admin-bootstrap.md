# 13 — Harden admin bootstrap

**What to build:** the bootstrap command reliably creates or promotes the configured admin Auth User, preserves existing roles, normalizes role strings, and is covered by tests so environments can safely prepare an admin before route lock-down.

**Blocked by:** 12 — Add global permission foundation

**Status:** ready-for-agent

- [ ] Running the bootstrap command for a missing configured Auth User creates an admin user with the configured email, password, and name behavior.
- [ ] Running the bootstrap command for an existing Auth User adds the `admin` Access Role without resetting the password.
- [ ] Existing non-empty role values are preserved while adding `admin`.
- [ ] Role-string handling avoids duplicate roles, trims whitespace, and writes comma-separated roles in the Better Auth-compatible format.
- [ ] Configured email handling is normalized consistently for lookup and creation.
- [ ] Tests cover missing-user creation, existing-user promotion, role preservation, email normalization, and password requirements for new-user creation.

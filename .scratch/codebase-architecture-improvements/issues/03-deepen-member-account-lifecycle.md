# 03 — Deepen Member account lifecycle

**What to build:** Member management works through one lifecycle module for listing managed accounts, creating linked Auth User and Member accounts, linking existing Auth Users, changing Member Status, and changing access state, while preserving ADR-0003 and ADR-0006.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Member management lists linked and unlinked Auth Users through one lifecycle module interface.
- [ ] Creating a linked account keeps Auth User creation and Member creation in one lifecycle workflow.
- [ ] If Member creation fails after Auth User creation, the lifecycle workflow compensates by removing the created Auth User.
- [ ] Member Status changes and access-state changes go through the lifecycle module rather than being coordinated directly by the management workflow.
- [ ] Tests cover linked/unlinked projection, linked account creation, compensation on failure, Member Status changes, and access-state changes through the module interface.
- [ ] Existing Member management behavior remains unchanged for users.

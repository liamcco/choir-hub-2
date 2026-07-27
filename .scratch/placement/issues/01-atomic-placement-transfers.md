# 01 — Add atomic Placement transfer service

Type: task
Status: ready-for-agent

Build the application write boundary for Placement transfers. It must support same-Choir Section changes, Choir transfers, unassignment, and the explicit no-Section state while preserving dated relationship history.

- [ ] Transfer uses today as the v1 effective date.
- [ ] Transfer validates the destination Choir and Section pairing.
- [ ] Transfer ends incompatible current relationships and creates destination relationships atomically.
- [ ] Transfer preserves the Section Placement to Choir Membership invariant.
- [ ] Former Users may transfer without a status change.
- [ ] Focused service tests cover success and failure cases.

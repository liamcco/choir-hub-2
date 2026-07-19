# 04 — Deepen dated history handling

**What to build:** Group Membership and Position Assignment share one internal dated-history module for period normalization, current-at-date semantics, and overlap detection, while preserving their separate choir-domain meanings.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Group Membership writes still reject overlapping periods for the same Member and Group.
- [ ] Position Assignment writes still reject overlapping periods for the same Position.
- [ ] Current and historical reads keep the same half-open period semantics.
- [ ] Shared dated-period behavior is tested once through a focused module interface and remains exercised through the organization workflows.
- [ ] No new public adapter seam is introduced unless a second real adapter or caller need exists.

# 04 — Symmetric Member relationships and detail navigation

**What to build:** Complete Member detail by allowing administrators to manage Group Memberships and Position Assignments inline from the Member side, using the same authoritative write behavior already available from Group and Position details. Make related Member, Group, and Position names navigable by replacing the currently visible detail rather than stacking dialogs, with explicit and browser Back navigation restoring the previous entity.

**Blocked by:** 02 — Group collection and direct-membership detail; 03 — Position collection and assignment detail.

**Status:** ready-for-agent

- [ ] Member detail can add or end Group Memberships through controls that expand inline within the current detail.
- [ ] Member detail can create or end Position Assignments through controls that expand inline within the current detail.
- [ ] Member-side Group Membership changes and Group-side Group Membership changes use the same authoritative write behavior and dated-history rules.
- [ ] Member-side Position Assignment changes and Position-side Position Assignment changes use the same authoritative write behavior and dated-history rules.
- [ ] Related Member, Group, and Position names are navigable from detail relationship sections.
- [ ] Following a related entity replaces the visible detail; it never stacks another dialog.
- [ ] After related-entity navigation, the explicit header action changes from Close to Back in a way that clearly communicates the navigation chain.
- [ ] Explicit Back and browser Back restore the previously visible detail and preserve its collection or hierarchy origin.
- [ ] Close exits the detail chain and reveals the originating collection.
- [ ] Inline relationship controls stack into usable fields and actions on narrow mobile screens.
- [ ] Pending, validation-error, and successful mutation states remain local to the expanded relationship section.
- [ ] Screen and navigation integration tests cover symmetric mutations, related-detail replacement, explicit Back, browser Back, Close, and the absence of nested dialogs through accessible user-visible behavior.


# 05 — Filtered Group hierarchy

**What to build:** Add the dedicated Variant C Group hierarchy page. It renders every Group as a legible indented tree with one descendant-inclusive, deduplicated member count, allows administrators to filter counts by Member Status and optionally include former Members, and opens the existing Group detail over the hierarchy without losing structural context.

**Blocked by:** 02 — Group collection and direct-membership detail.

**Status:** ready-for-agent

- [ ] View hierarchy from the Groups collection navigates to a dedicated full page rather than opening a modal.
- [ ] Every Group renders in a stable tree order with indentation that remains legible across several nesting depths.
- [ ] Each Group displays one descendant-inclusive current-member count deduplicated by Member across its subtree.
- [ ] The segmented control contains `All | Active | Passive`; All means active plus passive.
- [ ] Include former is an independent checkbox that adds former Members to the population selected by the segmented control.
- [ ] The default state is All with Include former unchecked.
- [ ] Changing filters changes counts only and never hides a Group.
- [ ] Groups with zero members remain visible and display zero under every filter state.
- [ ] Selecting a Group opens its existing route-backed detail over the hierarchy during in-app navigation.
- [ ] Closing Group detail returns to the hierarchy, and direct loading of the Group URL retains standalone behavior.
- [ ] Group detail continues to show and manage direct Group Memberships only; descendant-inclusive totals remain informational hierarchy values.
- [ ] The hierarchy and its filter controls remain readable and operable at mobile widths.
- [ ] Focused domain tests cover tree order, depth, descendant traversal, Member deduplication, Member Status populations, and dated-current semantics through the Group tree/read interface.
- [ ] Screen-level tests prove filter behavior, persistent zero-count Groups, selection, detail overlay, and return-to-hierarchy behavior through accessible user-visible outcomes.


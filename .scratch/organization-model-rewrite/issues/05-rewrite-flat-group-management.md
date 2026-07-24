# 05 — Rewrite flat Group management and effective rosters

**What to build:** Build Group management from the composable management modules around fixed flat Committee and Board reference records, scoped CSK-wide or to one Choir, with effective rosters.

**Blocked by:** 03 — Establish the composable organization-management UI.

**Status:** ready-for-agent

- [ ] The Group collection displays exactly `Name | Kind | Scope | Members`.
- [ ] Scope reads `CSK-wide` or the scoped Choir name.
- [ ] Members is the deduplicated current Effective Group Membership count.
- [ ] Group creation, structural editing, metadata editing, and parent selection are removed.
- [ ] The hierarchy action, hierarchy route, hierarchy screen, and tree logic are removed.
- [ ] Group detail displays fixed reference information read-only.
- [ ] Committee detail shows effective members with an explicit-membership or Position-derived source label.
- [ ] Committee detail permits starting and ending explicit Committee memberships.
- [ ] Board detail shows current and historical Position-derived membership and has no direct membership controls.
- [ ] A User represented by both explicit and Position-derived Committee membership appears once in the current roster with both sources explainable.
- [ ] Group history preserves explicit membership periods and Position-derived intervals without manufacturing stored aggregate records.
- [ ] Search and stable ordering use Name, Kind, Scope, and count as displayed.
- [ ] Current-actor Group predicates agree with the roster shown by the management read.
- [ ] Screen tests cover CSK-wide and Choir scopes, repeated names across scopes, effective counts, source labels, Board read-only behavior, and removal of hierarchy affordances.

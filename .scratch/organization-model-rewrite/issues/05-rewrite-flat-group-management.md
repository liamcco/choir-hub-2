# 05 — Rewrite flat Group management and effective rosters

**What to build:** Build Group management from the composable management modules around fixed flat Committee and Board reference records, scoped CSK-wide or to one Choir, with effective rosters.

**Blocked by:** 03 — Establish the composable organization-management UI.

**Status:** complete

- [x] The Group collection displays exactly `Name | Kind | Scope | Members`.
- [x] Scope reads `CSK-wide` or the scoped Choir name.
- [x] Members is the deduplicated current Effective Group Membership count.
- [x] Group creation, structural editing, metadata editing, and parent selection are removed.
- [x] The hierarchy action, hierarchy route, hierarchy screen, and tree logic are removed.
- [x] Group detail displays fixed reference information read-only.
- [x] Committee detail shows effective members with an explicit-membership or Position-derived source label.
- [x] Committee detail permits starting and ending explicit Committee memberships.
- [x] Board detail shows current and historical Position-derived membership and has no direct membership controls.
- [x] A User represented by both explicit and Position-derived Committee membership appears once in the current roster with both sources explainable.
- [x] Group history preserves explicit membership periods and Position-derived intervals without manufacturing stored aggregate records.
- [x] Search and stable ordering use Name, Kind, Scope, and count as displayed.
- [x] Current-actor Group predicates agree with the roster shown by the management read.
- [x] Screen tests cover CSK-wide and Choir scopes, repeated names across scopes, effective counts, source labels, Board read-only behavior, and removal of hierarchy affordances.

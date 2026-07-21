# 02 — Group collection and direct-membership detail

**What to build:** Replace the current Group management layout with the same table-based collection pattern established by Members. Groups are displayed in an unwrapped bordered table with `Name | Kind | Parent | Members`, where Members is the current direct Group Membership count. Selecting a Group opens its route-backed read-first detail, where existing Group fields and direct Group Memberships can be managed inline.

**Blocked by:** 01 — Member collection and route-backed detail.

**Status:** ready-for-agent

- [ ] The Groups collection uses the same shared collection frame, search treatment, header-action placement, and unwrapped bordered table presentation as Members.
- [ ] The Group table displays exactly `Name | Kind | Parent | Members` as its collection columns.
- [ ] The Members column counts current direct Group Memberships only and does not display descendant-inclusive hierarchy totals.
- [ ] Groups use a deliberate stable default order and have no edit, relationship, overflow-menu, or destructive action columns.
- [ ] Transient free-text search matches every textual value displayed in the Group table and does not use URL state.
- [ ] The Groups header contains a primary create action and a secondary View hierarchy action; the hierarchy behavior itself remains for ticket 05.
- [ ] Creating a Group transitions directly to its read-first detail.
- [ ] Selecting a Group opens route-backed detail over the collection during in-app navigation, while direct loading or refresh renders the same content standalone.
- [ ] Group detail presents Name, Group Kind, parent Group, and other existing editable fields read-first with an explicit Edit action.
- [ ] Group detail displays and manages direct Group Memberships only.
- [ ] Adding or ending a direct Group Membership expands controls inline and does not open a nested dialog.
- [ ] Current direct Group Memberships render before ended relationships; ended relationships appear in collapsed History and empty History is omitted.
- [ ] Desktop and mobile detail behavior reuses the responsive shell established by ticket 01 and retains obvious Close behavior.
- [ ] Screen-level tests cover the table, direct count meaning, create/detail navigation, inline Group Membership management, and history behavior through user-visible outcomes.


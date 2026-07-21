# 03 — Position collection and assignment detail

**What to build:** Replace the current Position management layout with the same table-based collection pattern established by Members. Positions are displayed in an unwrapped bordered table with `Name | Group scope | Current holder | Held since`, including duplicate display names and vacant Positions. Selecting a Position opens its route-backed read-first detail, where existing Position fields and Position Assignments can be managed inline.

**Blocked by:** 01 — Member collection and route-backed detail.

**Status:** ready-for-agent

- [ ] The Positions collection uses the same shared collection frame, search treatment, header-action placement, and unwrapped bordered table presentation as Members.
- [ ] The Position table displays exactly `Name | Group scope | Current holder | Held since` as its collection columns.
- [ ] Current holder and Held since are derived from the current Position Assignment.
- [ ] Vacant Positions display clear empty values for Current holder and Held since.
- [ ] Duplicate Position display names remain separate table rows and are understandable through their Group scope.
- [ ] Positions use a deliberate stable default order and have no edit, relationship, overflow-menu, or destructive action columns.
- [ ] Transient free-text search matches every textual value displayed in the Position table and does not use URL state.
- [ ] Creating a Position transitions directly to its read-first detail.
- [ ] Selecting a Position opens route-backed detail over the collection during in-app navigation, while direct loading or refresh renders the same content standalone.
- [ ] Position detail presents its display name, description, and Group scopes read-first with an explicit Edit action for existing capabilities.
- [ ] Position detail shows the current assignment directly and manages assignments through inline controls without nested dialogs.
- [ ] Ended Position Assignments appear in collapsed History, and History is omitted when empty.
- [ ] Position Assignment writes preserve dated-history rules and the invariant that one Position has at most one current holder across all Group scopes.
- [ ] Desktop and mobile detail behavior reuses the responsive shell established by ticket 01 and retains obvious Close behavior.
- [ ] Screen-level tests cover the table, duplicate names, vacancy, current-assignment derivation, create/detail navigation, inline assignment management, and history behavior through user-visible outcomes.


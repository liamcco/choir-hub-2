# 01 — Member collection and route-backed detail

**What to build:** Replace the current account-centric Members management screen with the Variant C Member collection and its complete create-to-detail path. Members are displayed in an unwrapped bordered table, selecting a Member opens a read-first route-backed detail during in-app navigation, and directly loading the same URL renders a standalone page. This slice also establishes the shared collection-frame, search-control, page-header-action, and responsive route-dialog interfaces that later Group and Position slices reuse.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The Members collection uses the shared collection pattern and displays `Name | Choir | Voice | Status` in an unwrapped bordered table.
- [ ] The collection uses a deliberate stable default order and has no edit, relationship, overflow-menu, or destructive action columns.
- [ ] Transient free-text search matches all textual content displayed by Member rows and communicates the number of displayed results without writing search state to the URL.
- [ ] Every current Choir membership and every current Voice is displayed; empty values remain readable and multiple current Voices receive a subtle accessible warning.
- [ ] The page follows the selected Variant C direction: airy spacing, quiet resource navigation, restrained chrome, and responsive mobile-first behavior.
- [ ] Create member preserves the existing behavior of creating an Auth User and linked skeletal Member together.
- [ ] Successful creation navigates directly to the new Member's read-first detail.
- [ ] Selecting a Member during in-app navigation opens a route-backed detail over the collection, while direct loading or refresh renders the same content as a standalone page.
- [ ] Desktop detail is reading-focused and capped at approximately 64rem; mobile detail is full-screen with obvious Close behavior and one scrollable content region.
- [ ] Member detail shows existing Member fields read-first, exposes Edit only for existing capabilities, and presents Auth User access as subordinate information.
- [ ] Current Group Memberships and Position Assignments are visible in Member detail without adding relationship mutation behavior yet.
- [ ] Ended Group Memberships and Position Assignments appear in a collapsed History section, and History is omitted when empty.
- [ ] Screen-level tests exercise visible behavior through accessible roles and names; focused tests cover the shared responsive route-dialog interface without asserting styling classes or private implementation details.


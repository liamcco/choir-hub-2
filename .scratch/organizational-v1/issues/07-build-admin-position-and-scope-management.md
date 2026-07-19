# 07 — Build admin Position and Position Scope management

**What to build:** Let admins create Positions with non-unique display names, scope each Position to one or more Groups, and distinguish shared Positions from separate same-named Positions.

**Blocked by:** 05 — Build admin Group management.

**Status:** resolved

- [x] Admins can create and edit Positions with name and description.
- [x] Position names are allowed to duplicate across distinct Positions.
- [x] Admins can scope a Position to one or more Groups.
- [x] Admins can remove a Position Scope without deleting the Position unless explicitly deleting the Position.
- [x] The UI makes the difference clear between one shared multi-scope Position and multiple same-named Positions.
- [x] Position management does not include current-holder fields.
- [x] The UI prioritizes existing shadcn/ui-style components and is responsive.
- [x] Tests cover duplicate names and multi-Group Position Scopes.

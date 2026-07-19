# 06 — Build admin Group Membership management

**What to build:** Let admins add Members to Groups over dated periods, end memberships, and view current and historical Group Memberships without any separate membership status.

**Blocked by:** 04 — Enable admin account and Member management; 05 — Build admin Group management.

**Status:** resolved

- [x] Admins can add a Member to a Group with a start date.
- [x] Admins can end a Group Membership with an end date.
- [x] Admins can view current Members of a Group.
- [x] Admins can view historical Members of a Group.
- [x] Admins can view a Member's current and historical Groups.
- [x] Group Membership has no status field or status UI.
- [x] Overlapping periods for the same Member and Group are rejected through the write interface.
- [x] The UI prioritizes existing shadcn/ui-style components and is responsive.

## Answer

Implemented admin Group Membership management at `/admin/group-memberships`.

The workflow adds and ends dated Group Membership periods through the organization write interface, maps overlap and invalid-period errors back to form fields, and shows Group-centric and Member-centric current, scheduled, and historical date buckets without any separate Group Membership status. Member labels use linked auth account name/email when available, with skeletal Member IDs as fallback.

Verification completed with focused service/action/screen tests, full test suite, typecheck, lint, and two-axis code review.

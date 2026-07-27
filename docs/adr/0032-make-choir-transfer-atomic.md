# Make Choir transfers atomic

A Choir transfer changes two dated relationships: it ends the User's current Choir Membership and any incompatible Section Placement, then starts the new Choir Membership and optionally a new Section Placement. The application must perform this as one atomic operation so a transfer cannot leave a User simultaneously in the old Choir and new Choir, or leave a Section Placement uncovered by its Choir Membership.

The Transfer dialog defaults to a new placement in the selected Choir but permits the explicit exceptional state “No Section for now.” The operation preserves ended relationship history and uses today as the effective date in v1; the date is intentionally not exposed in the first UI.

# Placement workspace

Status: ready-for-agent

## Outcome

Add a dedicated admin Placement workspace for managing a User's Member Status, Home Choir, and Section Placement. The workspace is roster-first and location-first: administrators navigate to where a User currently is, open the User, and transfer them from that context.

The Users collection remains focused on identity and account-related actions. Group Memberships and Position Assignments are not edited from Users or Placement.

## Navigation and URL state

- Placement opens with four top-level controls: `KK`, `DK`, `MK`, and `OTHERS`.
- Selecting a Choir reveals its Sections as alternatives.
- Selecting a Section reveals its User roster.
- `OTHERS` reveals `No Section` and `No Home Choir`.
- The initial selection is `All Users`.
- State is represented with query parameters only, never path segments.
- A selected User is represented with the existing `detail` query-parameter convention.
- Breadcrumbs show structural context only, such as `Placement / KK / KKB`.
- User detail opens as an overlay and supplies the User name as its title; the User name is not added to breadcrumbs.
- A User selected through search opens immediately and closes back to `All Users`.

## Roster presentation

- The search control is a combobox for finding and selecting one User; it does not filter the current roster.
- Each selected area or Section presents three separated lists: Active, Passive, and Former.
- Former Users are greyed out.
- Choir and Section counts show Active Users only.
- `OTHERS`, `No Section`, and `No Home Choir` counts include Users of every status.
- Former Users remain visible in the relevant roster and may be transferred without first changing status.
- A User with a Home Choir but no Section belongs in `No Section`.
- A User without a current Home Choir belongs in `No Home Choir`.

## User detail and mutations

- User detail shows current Member Status, Home Choir, and Section Placement first.
- Previous Choir Membership and Section Placement history is available below current state.
- Member Status and placement use separate controls and save actions.
- Transfer opens a dialog with the current Choir preselected.
- The Section selector contains only Sections belonging to the selected Choir.
- The dialog includes an explicit `No Section for now` option; a Section is required by default.
- A transfer defaults to today as its effective date, without exposing date editing in v1.
- A transfer is atomic: end incompatible current relationships and create the destination relationships together.
- Same-Choir Section changes and unassignment are supported through the same Transfer workflow.
- Former Users may be transferred directly; transfer does not implicitly change Member Status.
- A Home Choir may temporarily exist without a Section Placement, but the normal workflow requires a Section unless the explicit exception is selected.

## Domain invariants

The implementation follows the existing organization glossary and dated-relationship decisions:

- at most one current or overlapping Choir Membership per User;
- at most one current or overlapping Section Placement per User;
- Section Placement must be covered by a matching Choir Membership;
- incompatible Section Placement must not survive a Choir transfer;
- ended relationships remain historical records;
- Member Status remains independent of placement relationships.

## Verification

- Test atomic transfer success, same-Choir Section changes, Choir transfer with a new Section, transfer without a Section, and invalid Choir/Section combinations.
- Test roster categorization, Active-only counts, All-status OTHERS counts, and Former presentation.
- Test query-parameter navigation, search selection, overlay return behavior, and breadcrumbs through user-visible interaction.

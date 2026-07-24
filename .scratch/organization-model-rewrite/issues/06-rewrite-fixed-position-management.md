# 06 — Rewrite fixed Position management

**What to build:** Build Position management from the composable management modules, with read-only Position definitions and Scopes and Assignment eligibility enforced by the fixed catalog.

**Blocked by:** 03 — Establish the composable organization-management UI.

**Status:** complete

- [x] Position collection and detail read from the fixed reference catalog persisted in the target schema.
- [x] Scope labels support CSK, Choir, Section, and Group targets in deterministic order.
- [x] Repeated Position names remain distinguishable by their Scopes.
- [x] Position creation, metadata editing, and Scope editing are removed from the Position detail workflow.
- [x] Admins can start and end Position Assignments and see vacancies and history.
- [x] Voice Parent forms expose only Users placed in at least one scoped Section, with authoritative validation retained in the module.
- [x] Choir-scoped Master of Concerts and Master of Gigs forms expose only Users with the matching Home Choir.
- [x] Conductor forms do not require Choir Membership.
- [x] Group-scoped Position Assignments immediately affect effective Group rosters and access predicates after revalidation.
- [x] Party Mistress is Party Mastery-only; Master of Parties is Board + Party Mastery.
- [x] Master of Gigs and 1st Master of Concerts have their accepted dual Scopes.
- [x] Master of PR is Board-only and no Position is scoped to Web Mastery.
- [x] Tour Committee Treasurer remains distinct from Board Treasurer.
- [x] Screen tests cover fixed read-only definitions, typed Scope labels, eligibility, vacancies, history, and derived Group roster effects.

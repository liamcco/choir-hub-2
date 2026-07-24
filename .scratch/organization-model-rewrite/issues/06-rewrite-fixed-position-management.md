# 06 — Rewrite fixed Position management

**What to build:** Build Position management from the composable management modules, with read-only Position definitions and Scopes and Assignment eligibility enforced by the fixed catalog.

**Blocked by:** 03 — Establish the composable organization-management UI.

**Status:** ready-for-agent

- [ ] Position collection and detail read from the fixed reference catalog persisted in the target schema.
- [ ] Scope labels support CSK, Choir, Section, and Group targets in deterministic order.
- [ ] Repeated Position names remain distinguishable by their Scopes.
- [ ] Position creation, metadata editing, and Scope editing are removed.
- [ ] Admins can start and end Position Assignments and see vacancies and history.
- [ ] Voice Parent forms expose only Users placed in at least one scoped Section, with authoritative validation retained in the module.
- [ ] Choir-scoped Master of Concerts and Master of Gigs forms expose only Users with the matching Home Choir.
- [ ] Conductor forms do not require Choir Membership.
- [ ] Group-scoped Position Assignments immediately affect effective Group rosters and access predicates after revalidation.
- [ ] Party Mistress is Party Mastery-only; Master of Parties is Board + Party Mastery.
- [ ] Master of Gigs and 1st Master of Concerts have their accepted dual Scopes.
- [ ] Master of PR is Board-only and no Position is scoped to Web Mastery.
- [ ] Tour Committee Treasurer remains distinct from Board Treasurer.
- [ ] Screen tests cover fixed read-only definitions, typed Scope labels, eligibility, vacancies, history, and derived Group roster effects.

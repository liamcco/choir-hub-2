# 06 — Integrate architecture deepening across organizational v1

**What to build:** The architectural deepening work is verified across organizational v1, stale shallow interfaces are removed, and the existing organizational foundation still behaves as specified.

**Blocked by:** 02 — Deepen Auth User backed Member account lifecycle; 03 — Create one access policy module; 05 — Split organization around workflow modules.

**Status:** resolved

- [x] Existing organizational v1 tests pass after the module changes.
- [x] Lint, formatting, and configured codebase health checks pass or have documented rationale for any remaining advisory findings.
- [x] No obsolete broad interfaces, test fakes, or pass-through modules remain from the previous shape.
- [x] Admin Member account management, authorization, dated history, and organization workflows still match the domain glossary and ADRs.
- [x] The architecture review report's five candidates are all represented by completed implementation work or explicit documented rationale.

## Answer

- Candidate 1, Member Registry: implemented by `src/organization/member-registry.ts`; admin account management depends only on `MemberRegistry` for Member behavior and its test fake implements only that interface.
- Candidate 2, Auth User backed Member account lifecycle: implemented by `src/admin/member-management/account-lifecycle.ts`; account creation, linked skeletal Member creation, rollback, access state, and managed-account state live behind the lifecycle module and auth gateway seam.
- Candidate 3, Access Policy: implemented by `src/admin/access-policy.ts`; admin pages, server actions, and route protection share the same actor and policy vocabulary.
- Candidate 4, dated history: implemented by `src/organization/dated-history.ts`; Group Membership and Position Assignment workflow modules share period normalization, half-open current-at-date semantics, and overlap detection without introducing a public adapter seam.
- Candidate 5, workflow-shaped organization modules: implemented by `src/organization/group-structure.ts`, `src/organization/group-membership-history.ts`, `src/organization/position-scope-registry.ts`, `src/organization/position-assignment-history.ts`, and `src/organization/member-registry.ts`.
- Integration cleanup removed the old all-in-one `createOrganizationDomain` facade and `OrganizationDomain` type. Real callers already compose workflow modules directly, so keeping the broad facade would preserve the previous shallow interface shape without adding behavior.
- There is no `.scratch/architecture-deepening/map.md` file in this effort, so no map context pointer was updated.

# 06 — Complete the resource-first admin migration

**What to build:** Finish the admin information-architecture migration after all relationship capabilities have moved into Member, Group, and Position details. Make Members the admin landing destination, remove the standalone Group Membership and Position Assignment destinations without legacy redirects, verify the three table-based collections and route-backed detail flows as one coherent responsive experience, and remove the throwaway prototype from the production worktree after preserving its decision record.

**Blocked by:** 04 — Symmetric Member relationships and detail navigation; 05 — Filtered Group hierarchy.

**Status:** ready-for-agent

- [ ] The admin root redirects to the Members collection.
- [ ] Primary admin navigation contains exactly Members, Groups, and Positions.
- [ ] Standalone Group Membership and Position Assignment navigation items are removed.
- [ ] Standalone Group Membership and Position Assignment routes are removed without legacy redirects.
- [ ] All capabilities previously available through the retired relationship routes are available from the appropriate Member, Group, or Position detail before removal.
- [ ] Members, Groups, and Positions all use the same unwrapped bordered table collection pattern while retaining explicit resource-specific columns and row compositions.
- [ ] Organization overview remains behaviorally and visually unchanged apart from unavoidable shared navigation effects.
- [ ] The complete create, collection, detail, relationship, hierarchy, related-navigation, Back, and Close flows receive desktop and mobile browser verification.
- [ ] Keyboard operation, accessible names, focus behavior, dialog semantics, and reduced-motion expectations are verified across the shared collection and responsive detail interfaces.
- [ ] Loading, pending, empty, validation-error, authorization-denial, and unexpected-error states remain useful and local to the affected workflow.
- [ ] The winning Variant C decisions are represented by production modules rather than copied prototype implementation.
- [ ] Losing variants, the prototype switcher, the development-only preview route, and prototype-only access exceptions are removed from the production worktree.
- [ ] The full prototype is preserved outside main as a primary-source artifact, and the specification or implementation record identifies Variant C as the winner and summarizes why it was selected.
- [ ] The full project lint, test, type-check, and production build workflows pass after the migration.

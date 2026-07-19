# CSK Choir Hub v1 Organizational Foundation

Status: ready-for-agent

## Problem Statement

CSK Choir Hub needs a coherent v1 foundation for managing the choir organization before future modules such as Events, Attendance, internal information, and permissions are built. Today the app is mostly a scaffold with authentication and early Prisma models, but the product needs admins to manage Members, Groups, Group Memberships, Positions, Position Scopes, Position Assignments, and auth accounts without letting non-admins create their own accounts.

The v1 foundation must preserve the domain decisions already made: Groups are durable choir structure, Members are distinct from auth Users, membership and position holding are historical, and future concepts must not be collapsed into the organizational model prematurely.

## Solution

Build a v1 organizational admin and member-facing foundation.

Admins can create and manage auth Users/accounts and every organizational resource: Members, Groups, Group Memberships, Positions, Position Scopes, and Position Assignments. Admins are trusted to create sensible Group hierarchies without kind-based enforcement.

Non-admins cannot self-register. Once an admin gives them an account, they can log in, change their password, and view the full organizational structure in a read-only experience.

The implementation should keep route files thin, keep feature behavior behind small domain-facing interfaces, and preserve the codebase structure preferences already documented. The first version should focus on the organizational foundation and leave Events, Attendance, internal information, permissions, and temporary cohorts for later specs.

## User Stories

1. As an admin, I want to create a User account for a person, so that they can log in without public self-registration.
2. As an admin, I want to manage a User account's name, email, username, role, and access state, so that account records stay accurate.
3. As an admin, I want to disable or ban a User account, so that access can be removed without deleting organizational history.
4. As an admin, I want to reset or initiate password setup for a User account, so that a member can regain access.
5. As an admin, I want to create a Member linked to a User, so that the person exists in the choir domain.
6. As an admin, I want each Member to have exactly one overall Member Status, so that the directory can distinguish active, passive, and former members.
7. As an admin, I want to change a Member's Member Status, so that changes in their overall relationship to the choir organization are reflected.
8. As an admin, I want Member profile fields to stay minimal in v1, so that we do not collect or model unclear data before workflows require it.
9. As an admin, I want to create a Group, so that durable choir structure can be represented.
10. As an admin, I want to classify each Group by Group Kind, so that choirs, sections, committees, boards, and projects can be distinguished.
11. As an admin, I want Group Kinds to be fixed in v1, so that arbitrary categorization does not create unclear product behavior.
12. As an admin, I want to arrange Groups in a hierarchy, so that sections, committees, boards, and projects can sit under the relevant parent Groups.
13. As an admin, I want the system to allow flexible Group hierarchy, so that I can model the real choir organization without premature enforcement rules.
14. As an admin, I want Group names to be unique among sibling Groups, so that one part of the hierarchy does not contain duplicate labels.
15. As an admin, I want Group names not to be globally unique, so that different choir branches can reuse natural names like Altos or Concert Group.
16. As an admin, I want to edit Group names, descriptions, kinds, and parent relationships, so that the organizational structure can evolve.
17. As an admin, I want to remove a Group only when doing so has clear consequences for memberships, positions, and hierarchy, so that history is not accidentally corrupted.
18. As an admin, I want to add a Member to a Group with a start date, so that Group Membership history begins at the correct time.
19. As an admin, I want to end a Member's Group Membership with an end date, so that past membership remains visible without treating the Member as currently in the Group.
20. As an admin, I want Group Membership to have no separate status, so that membership is determined by its dates and the Member's overall status remains separate.
21. As an admin, I want to see current Members of a Group, so that I can understand who belongs there today.
22. As an admin, I want to see historical Members of a Group, so that I can understand who belonged there in the past.
23. As an admin, I want to see all Groups a Member currently belongs to, so that I can understand their present organizational placement.
24. As an admin, I want to see all Groups a Member historically belonged to, so that transfers and former memberships remain traceable.
25. As an admin, I want the system to preserve the invariant that membership periods for the same Member and Group should not overlap, so that historical answers stay coherent.
26. As an admin, I want overlap enforcement to be handled by write logic or later database constraints, so that v1 can proceed without overfitting the schema.
27. As an admin, I want to create a Position, so that durable choir offices and roles can be represented.
28. As an admin, I want Position names to be display text rather than globally unique identifiers, so that separate scoped Positions can share a natural name.
29. As an admin, I want to scope a Position to one or more Groups, so that roles like Concert Master can be relevant to both a board and a concert group.
30. As an admin, I want one shared Position to have multiple Position Scopes, so that one role is not duplicated when it is genuinely shared across Groups.
31. As an admin, I want separate Positions to be allowed to share a name, so that three choirs can each have their own Concert Master.
32. As an admin, I want to assign a Position to a Member with a start date, so that the holder history starts at the correct time.
33. As an admin, I want to end a Position Assignment with an end date, so that former holders remain visible without being current.
34. As an admin, I want a Position to have only one holder at a time, so that office ownership is unambiguous.
35. As an admin, I want to see the current holder of a Position, so that I can know who currently holds an office.
36. As an admin, I want to see historical holders of a Position, so that leadership and role history can be reconstructed.
37. As an admin, I want to see all Positions a Member currently holds, so that their responsibilities are visible.
38. As an admin, I want to see all Positions a Member historically held, so that past responsibilities are traceable.
39. As an admin, I want the system to preserve the invariant that Position Assignments for the same Position should not overlap, so that one Position has only one holder at a time.
40. As an admin, I want to manage organizational resources from an admin panel, so that I do not need direct database access.
41. As an admin, I want the admin panel to provide clear create, edit, and history workflows, so that common administrative work is efficient.
42. As an admin, I want validation feedback to be immediate and specific, so that mistakes can be corrected without losing context.
43. As an admin, I want mobile-responsive admin screens, so that urgent fixes can be made from a phone.
44. As a non-admin, I want public self-registration to be unavailable, so that only approved people get accounts.
45. As a non-admin with an account, I want to log in, so that I can access the internal choir platform.
46. As a non-admin with an account, I want to change my password, so that I can maintain account security.
47. As a non-admin with an account, I want to view the full Group hierarchy, so that I can understand the choir organization.
48. As a non-admin with an account, I want to view Members and their current Group Memberships, so that I can understand who belongs where.
49. As a non-admin with an account, I want to view Positions, Position Scopes, and current holders, so that I can understand responsibilities in the choir.
50. As a non-admin with an account, I want to view historical organizational information where available, so that I can understand past memberships and position assignments.
51. As a non-admin, I want organizational views to be read-only, so that I cannot accidentally change administrative data.
52. As a non-admin, I want responsive views, so that the organizational structure is usable on mobile.
53. As a future developer, I want organizational domain behavior behind a small interface, so that tests and callers do not depend on scattered implementation details.
54. As a future developer, I want Prisma schema files split by ownership, so that future modules can evolve without making one large schema file harder to navigate.
55. As a future developer, I want generated Prisma client files to remain untouched, so that regeneration is safe.
56. As a future developer, I want thin Next.js route files, so that pages compose feature modules instead of accumulating all implementation detail.
57. As a future developer, I want reusable UI modules extracted when they improve locality, so that repeated workflows can be changed in one place.
58. As a future developer, I want duplication reviewed with judgment, so that unclear concepts are not abstracted too early.
59. As a future developer, I want shadcn/ui components prioritized for common UI patterns, so that the app stays visually and structurally consistent.
60. As a future developer, I want the spec to keep deferred modules out of scope, so that Events, Attendance, internal information, and permissions can be designed when their workflows are clearer.

## Implementation Decisions

- Build the v1 around the organizational domain concepts already recorded in the glossary: Group, Group Kind, Member, Member Status, Group Membership, Position, Position Scope, Position Assignment, and Auth User.
- Public account self-registration remains disabled. Admins create and manage accounts.
- Non-admin Users can log in, change their password, and view the full organizational structure read-only.
- Admins can create, update, and manage Users/accounts and all organizational resources.
- Keep auth Users separate from Members. In v1, every Member is backed by exactly one auth User through a required unique `userId`.
- Keep choir-domain relations out of the autogenerated auth User model. Because Prisma requires opposite relation fields for modeled relations, `Member.userId` remains a required unique scalar for now rather than a Prisma relation.
- Keep Member skeletal in v1. Member profile, contact, notes, and similar fields are deferred.
- Add one overall Member Status with the v1 values active, passive, and former.
- Model Groups as durable organizational units, not temporary cohorts, attendance lists, permission groups, or event lists.
- Use a constrained v1 Group Kind vocabulary: choir, section, committee, board, and project.
- Keep Group hierarchy flexible in v1. Admins are trusted to create sensible parent/child structures without kind-based enforcement.
- Keep Group names unique among sibling Groups, not globally unique.
- Remove the former container flag from Groups; non-member-bearing containers are not a separate v1 concept.
- Model Group Membership as historical membership with a start date and optional end date.
- Do not add a status to Group Membership. Its dates determine whether membership is current or historical.
- Preserve the invariant that a Member should not have overlapping membership periods in the same Group.
- Model Positions as durable offices or roles.
- Treat Position names as non-unique display text.
- Keep Position Scope as the relationship between a Position and the Groups where that Position has standing relevance.
- Model Position Assignment as historical holder records with a start date and optional end date.
- Preserve the invariant that a Position can only have one holder at a time across all of its Position Scopes.
- Defer PostgreSQL exclusion constraints for overlap prevention until write flows or migrations make the enforcement point clear.
- Keep Prisma schema files split by ownership. Auth models stay in the auth schema; organizational models stay in their own schema; future modules add separate schema files.
- Generated Prisma client output must not be hand-edited.
- Keep Next.js route files thin. Route files should compose screens and modules, not hold the main feature implementation.
- Prefer Server Components by default. Use Client Components only for interaction, browser APIs, optimistic state, or controlled UI state, with the client seam as low as practical.
- Prefer composable UI modules over large TSX files. Extract reusable UI when it creates locality and a stable interface.
- Prioritize existing shadcn/ui-style components for common UI controls, layout primitives, dialogs, menus, tables, forms, feedback, and navigation.
- Avoid duplicate business rules, validation rules, Prisma query shapes, and UI interaction patterns. Do not extract abstractions before the concept is clear.

## Testing Decisions

- Test organizational behavior through the highest practical seam: a small domain-facing write/read module for organizational resources.
- Tests should assert external behavior and domain invariants, not implementation details.
- Schema validity should be checked with Prisma formatting and generation.
- Admin write tests should cover creating and updating Groups, Members, Group Memberships, Positions, Position Scopes, and Position Assignments.
- Admin account-management tests should cover admin-created accounts and the absence of non-admin self-registration.
- Non-admin access tests should cover login, password change, and read-only access to organizational structure.
- Authorization tests should cover that non-admins cannot create, update, or delete organizational resources.
- Group tests should cover constrained Group Kinds, flexible hierarchy, sibling-only name uniqueness, and absence of container behavior.
- Member tests should cover one overall Member Status and separation from auth User concerns.
- Group Membership tests should cover historical start/end dates, no separate status, current lookup behavior, historical lookup behavior, and non-overlap invariants at the chosen write seam.
- Position tests should cover duplicate Position names, multiple Position Scopes, shared scoped Positions, and distinct Positions that share display names.
- Position Assignment tests should cover historical holder records, current holder lookup behavior, historical holder lookup behavior, and one-holder-at-a-time invariants at the chosen write seam.
- UI tests should focus on meaningful admin and read-only member workflows rather than incidental component structure.

## Out of Scope

- Events, rehearsals, concerts, meetings, services, and other dated choir activities.
- Attendance tracking.
- Event targeting by Groups.
- Internal information, notices, documents, or knowledge-base content.
- Fine-grained permissions and visibility beyond v1 admin versus non-admin behavior.
- Temporary or derived cohorts.
- Member profile/contact details beyond the skeletal Member model.
- Database-level PostgreSQL exclusion constraints for temporal overlap prevention.
- Hard enforcement of valid parent/child Group Kind combinations.
- Public account registration.
- Treating Group as a permission group, event list, attendance list, or non-member-bearing container.

## Further Notes

- The unresolved product behavior of each Group Kind should be revisited when navigation and admin workflows make those distinctions concrete.
- Position Assignment may later need metadata such as appointment source, notes, or handover date, but this is not needed for v1.
- The `Member.userId` link may later become a database-enforced foreign key if the project accepts either raw SQL constraints or a relation surface back on auth User.
- The v1 admin panel should favor responsive, mobile-first screens and immediate feedback for mutations.
- Future modules should follow the codebase structure guide: feature-oriented modules, split Prisma schema ownership, thin route files, shadcn/ui-first common controls, composable UI, and tests through module interfaces.

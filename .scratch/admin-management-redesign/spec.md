# Resource-first admin management redesign specification

Status: ready-for-agent

## Problem Statement

CSK Choir Hub's organization-management area exposes the right underlying capabilities, but its current structure is organized around implementation concepts rather than the way an administrator thinks about the choir. Members are presented primarily as Auth User accounts, Group Memberships and Position Assignments are separate top-level destinations, creation shares space with browsing, and tables contain mutation controls. This makes routine administration harder to scan and forces administrators to move between disconnected screens to understand one Member, Group, or Position.

The current screens also lack a consistent collection-to-detail model. There is no shared route-backed detail experience, related entities do not form a coherent navigation flow, ended relationships are not consistently separated from current relationships, and the Group hierarchy does not yet combine nesting with useful member totals and status controls. On small screens, the current management layouts do not provide a deliberate full-screen detail and relationship-management treatment.

## Solution

Redesign organization management around three primary resources: Members, Groups, and Positions. Each resource receives a browse-first collection with a consistent page header, transient search, create action, and unwrapped bordered table. Selecting an entity opens a read-first, route-backed detail. During in-app navigation this detail appears as a generously sized desktop dialog or a full-screen mobile surface; direct loading or refresh presents the same content as a standalone page.

Move Group Membership and Position Assignment management into the details of the entities they relate. Make management symmetric: Group Memberships can be managed from either Member or Group detail, and Position Assignments from either Member or Position detail. Related names replace the visible detail rather than stacking dialogs, while browser Back and an explicit Back control return to the previous entity.

Add a dedicated Group hierarchy page that always renders every Group as an indented tree. It shows one descendant-inclusive, deduplicated current-member count per Group, supports Member Status filtering and optional former Members, and keeps zero-count Groups visible.

Use the validated Variant C visual direction: an airy collection canvas, quiet resource navigation, a reading-focused desktop detail up to approximately 64rem wide, a single scrollable detail composition, and full-screen mobile details with persistent, obvious Back and Close affordances. Prototype code remains a disposable source of visual evidence and must not be promoted directly into production.

## User Stories

1. As an administrator, I want Members, Groups, and Positions to be the three primary admin destinations, so that navigation matches the resources I manage.
2. As an administrator, I want the admin root to take me to Members, so that entering admin always lands on a useful collection.
3. As an administrator, I want Group Memberships removed from primary navigation, so that relationships do not appear as if they were independent resources.
4. As an administrator, I want Position Assignments removed from primary navigation, so that assignments are managed in the context of a Member or Position.
5. As an administrator, I want consistent collection headers across Members, Groups, and Positions, so that each screen is immediately understandable.
6. As an administrator, I want a clear create action in each collection header, so that starting creation does not compete with browsing the table.
7. As an administrator, I want the main collection table displayed as an unwrapped bordered surface, so that the page remains airy and browse-focused.
8. As an administrator, I want collection tables to avoid edit and relationship action columns, so that I can scan information without control clutter.
9. As an administrator, I want deliberate default ordering, so that collections are predictable before interactive sorting exists.
10. As an administrator, I want to search all displayed textual content in a collection, so that I can find records using any visible fact.
11. As an administrator, I want search to remain transient, so that ordinary filtering does not create unnecessary URL state.
12. As an administrator, I want the number of displayed results communicated after searching, so that I can understand the scope of the result.
13. As an administrator, I want selecting a table row to open that entity's detail, so that the table remains a browsing surface.
14. As an administrator, I want Member collections to represent choir Members rather than Auth User accounts, so that people are the primary concept.
15. As an administrator, I want Member rows to show Name, Choir, Voice, and Status, so that the most useful choir facts are visible together.
16. As an administrator, I want every current Choir membership shown in the Choir column, so that Members in multiple Choirs are represented accurately.
17. As an administrator, I want every current Voice shown in the Voice column, so that the table does not hide inconsistent or intentional multiplicity.
18. As an administrator, I want a subtle warning when a Member has multiple current Voices, so that unusual data is noticeable without overwhelming the table.
19. As an administrator, I want empty Choir and Voice states to remain readable, so that incomplete skeletal Members are not confusing.
20. As an administrator, I want Member Status visible at a glance, so that active, passive, and former Members are distinguishable.
21. As an administrator creating a Member, I want the current combined Auth User and skeletal Member behavior preserved, so that access and domain identity remain linked as they are today.
22. As an administrator, I want Auth User access shown as subordinate information in Member detail, so that login state does not replace the Member domain concept.
23. As an administrator, I want Group rows to show Name, Kind, Parent, and Members, so that I can understand a Group's place and direct size.
24. As an administrator, I want the Members value in the Group collection to count current direct Group Memberships only, so that the table has one precise meaning.
25. As an administrator, I want a secondary View hierarchy action on the Groups collection, so that I can switch from resource browsing to structural understanding.
26. As an administrator, I want the hierarchy to be a dedicated full page, so that deep nesting has enough space and does not feel constrained by a modal.
27. As an administrator, I want every Group rendered in the hierarchy, so that filters never make the organization structure incomplete.
28. As an administrator, I want Groups indented by parentage, so that several levels of nesting remain legible.
29. As an administrator, I want one member count per hierarchy row, so that the tree stays quiet and easy to scan.
30. As an administrator, I want hierarchy counts to include descendants, so that each Group communicates the size of its whole subtree.
31. As an administrator, I want hierarchy counts deduplicated by Member, so that a Member in several descendant Groups is not counted more than once.
32. As an administrator, I want All, Active, and Passive count controls, so that I can inspect the hierarchy for relevant Member Status populations.
33. As an administrator, I want All to mean active plus passive, so that the default represents current organizational participation.
34. As an administrator, I want Include former to be independent of the status control, so that I can add former Members to whichever current population I am examining.
35. As an administrator, I want All selected and Include former unchecked by default, so that the initial hierarchy reflects current active and passive Members.
36. As an administrator, I want zero-count Groups to remain visible under every filter, so that counts do not distort the hierarchy.
37. As an administrator, I want selecting a hierarchy Group to open its detail over the hierarchy, so that I keep my structural context.
38. As an administrator, I want closing a Group detail opened from the hierarchy to return to the hierarchy, so that I do not lose my place.
39. As an administrator, I want an individual Group detail to show and manage direct Group Memberships only, so that hierarchy totals do not blur relationship ownership.
40. As an administrator, I want Position rows to show Name, Group scope, Current holder, and Held since, so that occupancy is visible without opening every Position.
41. As an administrator, I want Positions with duplicate display names to remain distinguishable by Group scope, so that valid duplicate names are not treated as errors.
42. As an administrator, I want vacant Positions clearly represented, so that an empty current holder is not mistaken for missing data.
43. As an administrator, I want Held since derived from the current Position Assignment, so that the displayed date has historical meaning.
44. As an administrator, I want Held since empty for a vacant Position, so that the collection does not imply a nonexistent assignment.
45. As an administrator, I want create and detail URLs to open as dialogs during in-app navigation, so that I retain collection context.
46. As an administrator, I want a direct load or refresh of a create or detail URL to show the same content as a standalone page, so that URLs remain durable and shareable.
47. As an administrator, I want successful creation to transition directly to the new entity's read-first detail, so that I can confirm the result and continue managing it.
48. As an administrator, I want existing entity fields to be read-first, so that opening detail does not immediately look like a form.
49. As an administrator, I want an explicit Edit action for existing editable fields, so that mutations are intentional.
50. As an administrator, I want one vertically scrollable detail composition without internal tabs, so that all relevant facts remain discoverable in v1.
51. As an administrator, I want current relationships shown directly in detail, so that the entity's present state is immediately visible.
52. As an administrator, I want ended Group Memberships and Position Assignments placed in a collapsed History section, so that the current state remains primary.
53. As an administrator, I want History omitted when no ended relationships exist, so that empty sections do not add noise.
54. As an administrator, I want relationship controls to expand inline within the current detail, so that management does not stack another dialog.
55. As an administrator, I want to manage Group Memberships from Member detail, so that I can maintain all of one Member's Group relationships together.
56. As an administrator, I want to manage Group Memberships from Group detail, so that I can maintain all direct Members of one Group together.
57. As an administrator, I want to manage Position Assignments from Member detail, so that I can maintain one Member's offices in context.
58. As an administrator, I want to manage Position Assignments from Position detail, so that I can maintain a Position's holder and history in context.
59. As an administrator, I want related entity names to be navigable, so that I can follow relationships without returning to collections.
60. As an administrator, I want a related entity to replace the visible detail rather than open another modal, so that the interface never becomes a stack of dialogs.
61. As an administrator, I want an explicit Back action after following a related entity, so that the replacement model is understandable.
62. As an administrator, I want browser Back to return to the previous entity, so that route navigation follows normal browser expectations.
63. As an administrator, I want closing detail to return to the collection or hierarchy beneath it, so that context is preserved.
64. As a desktop administrator, I want a generously sized centered detail surface, so that summaries, relationship lists, inline forms, and collapsed history have comfortable proportions.
65. As a desktop administrator, I want the detail reading width capped at approximately 64rem, so that content remains readable on large displays.
66. As a mobile administrator, I want create and detail surfaces to use the full screen, so that controls are not squeezed into a small modal.
67. As a mobile administrator, I want Back and Close visible at the top of the full-screen detail, so that there is always an obvious escape path.
68. As a mobile administrator, I want inline relationship forms to stack into usable controls, so that relationship management remains possible on a narrow screen.
69. As a keyboard user, I want row selection, navigation, filters, expandable controls, and dialog actions to be accessible without a pointer, so that admin workflows remain operable.
70. As a screen-reader user, I want collections, dialogs, relationships, history, and hierarchy controls to expose clear roles and names, so that the structure is understandable non-visually.
71. As a maintainer, I want repeated stable collection chrome shared behind a small interface, so that consistent changes remain local.
72. As a maintainer, I want Member, Group, and Position tables and details to remain explicit feature modules, so that domain differences are readable at a glance.
73. As a maintainer, I want hierarchy counting to use one authoritative domain implementation, so that collection, hierarchy, and tests do not duplicate membership rules.
74. As a maintainer, I want route-dialog behavior isolated behind one responsive shell interface, so that desktop, mobile, intercepted, and standalone rendering stay consistent.
75. As a maintainer, I want the chosen prototype conclusions rewritten as production modules, so that throwaway shortcuts do not become permanent architecture.

## Implementation Decisions

- The admin information architecture is resource-first with three primary destinations: Members, Groups, and Positions.
- The admin root redirects to the Members collection.
- Remove standalone Group Membership and Position Assignment navigation items and routes. No legacy redirects are required for those retired routes.
- Leave the organization overview unchanged. The redesign is confined to organization-management workflows.
- Preserve existing authorization requirements for every admin route and mutation.
- Each collection uses the same stable collection-frame behavior: page heading and supporting text, header actions, transient search, result feedback, and an unwrapped bordered table surface.
- Share only modules whose behavior is stable across resources: the collection frame, page-header action placement, the small search control, and the responsive route-dialog shell. These modules should be deep enough that their small interfaces hide responsive and interaction details.
- Keep Member, Group, and Position collection tables and detail compositions explicit within their respective feature modules. Do not introduce schema-driven entity rendering, generic column configuration, or a universal relationship renderer.
- Server-rendered screens remain the default. Client-side modules should begin at the lowest seam that requires transient search, inline expansion, dialog interaction, browser navigation, or responsive interaction state.
- Collection queries return screen-shaped read models containing the textual fields and current relationship summaries required by their table. They must not make table renderers reconstruct domain meaning from raw persistence records.
- Search is case-insensitive free-text matching across every textual value displayed in the current table. It is transient client state and is not encoded in the URL.
- Interactive column sorting is deferred. Each resource query supplies a deliberate, stable default order, with names as the principal browse order and stable identity as a tie-breaker where necessary.
- Table rows are browse affordances. Do not add edit, relationship, overflow-menu, or destructive action columns.
- Member is the collection's primary entity. Auth User identity, access state, roles, and credentials remain subordinate information shown inside Member detail where relevant.
- Member collection columns are Name, Choir, Voice, and Status.
- Choir values are derived from all current Group Memberships whose Group Kind is Choir.
- Voice values are derived from all current Group Memberships whose Group Kind is Section. Multiple current Voices are valid domain data and must all render. Use a subtle warning indicator when more than one is present; do not reject or silently collapse the data.
- Create member preserves existing behavior: create the Auth User and its linked skeletal Member together. Successful creation navigates to the new Member detail.
- Group collection columns are Name, Kind, Parent, and Members. Members means current direct Group Memberships only.
- The Groups header includes View hierarchy as a secondary action. The hierarchy is a dedicated route, not a modal.
- The hierarchy read model contains every Group in stable tree order plus its depth and one accumulated member count for the active filter state.
- Hierarchy counts are descendant-inclusive and deduplicated by Member. A Member appearing in several descendants contributes once to an ancestor's count.
- The hierarchy status control is segmented All, Active, and Passive. All means active plus passive. Include former is an independent checkbox that adds former Members to the selected population.
- The hierarchy defaults to All with Include former unchecked.
- Hierarchy filtering changes counts only. It never removes Groups, including Groups whose count becomes zero.
- Group selection from the hierarchy uses the same route-backed Group detail as selection from the collection, rendered over the hierarchy during in-app navigation. Closing returns to the hierarchy.
- Group detail shows and manages direct Group Memberships only. Descendant-inclusive hierarchy totals do not appear as editable relationship totals.
- Position collection columns are Name, Group scope, Current holder, and Held since.
- Position names remain non-unique display text. Group scope supplies necessary context for duplicate names.
- Current holder and Held since are derived from the current Position Assignment. Both are empty-state values when the Position is vacant.
- Create and detail experiences are route-backed. In-app navigation uses the framework's route interception and parallel rendering conventions to present the route as a dialog over the current collection or hierarchy.
- Direct navigation and refresh render the same create or detail content as a standalone page. The detail module's interface must not depend on a dialog parent to function.
- The responsive route-dialog shell owns presentation differences: a centered desktop surface and full-screen small-screen surface, one scroll container, accessible title/description relationships, focus management, Escape behavior, Back/Close affordances, and return-to-background behavior.
- Adopt the validated Variant C proportions and information hierarchy: airy collection spacing, quiet resource navigation, restrained chrome, a reading-focused desktop surface capped at approximately 64rem, and clear section rhythm around read-first summaries and relationships.
- Detail uses one scrollable page without internal tabs in v1.
- Existing fields render read-first. An explicit Edit action reveals editing only for capabilities that already exist.
- Current Group Memberships and Position Assignments render directly in their relevant detail sections.
- Ended Group Memberships and Position Assignments render in one collapsed History section. Omit History when there are no ended relationships.
- Relationship management expands inline in the current detail. Do not open nested dialogs for add, change, end, or assignment forms.
- Relationship management is symmetric. Member and Group details call the same authoritative Group Membership write behavior; Member and Position details call the same authoritative Position Assignment write behavior.
- Related entity names navigate to their own route by replacing the visible detail. Do not stack detail dialogs.
- Related-detail navigation creates normal browser history. Browser Back and the explicit Back control return to the previously visible entity. Close exits the detail chain and reveals its originating collection or hierarchy.
- The route is the durable identity of the visible entity. Ephemeral presentation state such as search text, expanded inline forms, and collapsed History does not need URL persistence.
- Preserve dated-history semantics from existing domain decisions: current Group Membership and Position Assignment state is determined by dated records; ending a relationship does not delete its history.
- Preserve the invariant that a Position has at most one current holder across all its Group scopes.
- Do not copy the throwaway prototype implementation into production. Rebuild the selected behavior using production query modules, write modules, shared primitives, accessibility handling, and error/pending states.
- Delete the losing prototype variants and prototype switcher from the main implementation after the winning decisions are folded into production. Preserve the complete prototype separately as a primary-source artifact according to the project prototype workflow.

## Testing Decisions

- Tests cover external behavior through module interfaces rather than private implementation details. A good test proves what an administrator can see or do and which navigation or domain result follows; it does not assert internal JSX structure, styling class names, private helper calls, or ORM query construction.
- The primary feature test seam is the rendered route-level screen interface. Exercise collections, transient search, hierarchy controls, route-backed create/detail presentation, related-detail replacement, Back/Close behavior, inline relationship expansion, and History visibility through accessible names and user-visible outcomes.
- Screen tests should use representative screen-shaped data including multiple Choir memberships, multiple current Voices, an empty Choir/Voice state, all Member Status values, duplicate Position names, a vacant Position, deep Group nesting, zero-count Groups, and ended relationships.
- Member collection tests prove the four columns render the required current data, multiple Choirs and Voices remain readable, multiple Voices receive a subtle accessible warning, and search matches every displayed textual field.
- Group collection tests prove the collection Members count is direct-only and that the hierarchy action navigates to the dedicated hierarchy.
- Position collection tests prove duplicate names remain present, Group scope distinguishes them, current assignment values render correctly, and vacant Positions have empty holder/date states.
- Hierarchy tests at the rendered screen seam prove every Group remains visible at every filter setting, indentation/depth is communicated, zero counts remain present, All/Active/Passive alter counts correctly, Include former composes independently, and selecting a Group opens detail over the hierarchy.
- The existing Group tree/read module remains the focused domain seam for tree order, depth, orphan/cycle resilience, descendant traversal, descendant-inclusive membership accumulation, and Member deduplication. Extend this module or introduce one adjacent screen-read module only if the existing interface cannot hide count complexity cleanly.
- Existing dated-history module interfaces remain the focused domain seam for current-versus-ended Group Membership and Position Assignment semantics. Reuse prior tests for half-open periods, overlap prevention, and current relationship derivation.
- Detail screen tests prove read-first rendering, explicit Edit behavior for existing capabilities, current relationship visibility, omission of empty History, collapsed non-empty History, and inline relationship controls without nested dialogs.
- Navigation integration tests prove in-app selection renders a dialog over the originating surface, direct loading renders standalone content, creation transitions to the new detail, related entity selection replaces the current detail, browser Back restores the previous detail, and Close restores the originating collection or hierarchy.
- Responsive shell tests focus on the shared responsive route-dialog interface. Prove accessible desktop dialog semantics and full-screen mobile semantics, visible Back/Close controls, one scrollable content region, focus containment/restoration where applicable, Escape handling on desktop, and usable stacked inline controls at narrow widths.
- Responsive visual behavior should receive a small browser-level regression suite at representative desktop and mobile viewports. Favor stable role/text assertions plus a few purposeful screenshots over broad pixel snapshots.
- Mutation tests remain at existing feature write interfaces. Prove symmetric callers delegate to the same Group Membership or Position Assignment behavior, authorization remains enforced, successful mutations refresh the relevant detail/read model, and dated-history invariants remain intact.
- Server action and route adapters remain thin tests for parsing, delegation, revalidation/navigation, pending/error translation, and framework-specific behavior. Do not duplicate the domain matrix already covered through write and dated-history interfaces.
- Prior art includes existing route/navigation tests, organization management action tests, Group tree tests, dated-history tests, account screen tests, and shared dialog primitives.
- The organization overview should receive a non-regression check only where shared navigation changes could affect it. Its content and layout are not part of this redesign.

## Out of Scope

- Changing the organization overview screen.
- Adding Member profile fields or Member profile editing that does not already exist.
- Adding deletion for Members, Groups, Positions, Group Memberships, or Position Assignments.
- Adding new entity lifecycle behavior beyond reorganizing existing create, update, membership, and assignment capabilities.
- Changing Auth User credential, session, passkey, two-factor, ban, or role semantics.
- Treating Auth User as the canonical choir person instead of Member.
- Enforcing exactly one current Voice per Member.
- Adding interactive table column sorting.
- Persisting collection search in URLs or durable storage.
- Adding generic schema-driven admin pages, generic column configuration, or a universal relationship renderer.
- Adding legacy redirects for retired Group Membership and Position Assignment routes.
- Showing separate direct and effective member totals in the hierarchy.
- Hiding zero-count Groups from the hierarchy.
- Opening hierarchy in a modal.
- Stacking detail or relationship dialogs.
- Adding internal tabs to detail in v1.
- Changing Group Membership or Position Assignment dated-history decisions.
- Changing the single-current-holder invariant for Positions.
- Promoting prototype code directly into production.

## Further Notes

- The chosen visual direction is prototype Variant C. The prototype validated the airy four-column collections, deep hierarchy readability, approximately 64rem reading-focused desktop detail, full-screen mobile detail, inline relationship form treatment, and explicit Back/Close model.
- The replacement-navigation prototype showed that moving from Group detail to Member detail is understandable when the header changes from Close to Back and the originating hierarchy remains beneath the route-backed detail.
- Representative prototype data intentionally included duplicate Position names, multiple Choir memberships, multiple current Voices, a vacant Position, deep nesting, zero-count Groups, all Member Status values, and historical relationships. Production test fixtures should preserve those stress cases.
- Domain vocabulary must follow the project glossary: Member is distinct from Auth User; Voice is a current Section membership; Group Membership and Position Assignment are dated records; Position Scope is not ownership; and Member Status is independent of Group Membership history.
- Implementation should optimize for locality. Collection chrome and route-dialog mechanics should change in one shared module, while resource-specific query meaning and detail composition remain close to the Member, Group, and Position workflows that own them.

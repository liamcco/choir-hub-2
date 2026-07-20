# Access control permission system specification

Status: ready-for-agent

## Problem Statement

CSK Choir Hub currently has authentication, Better Auth admin capabilities, organization management screens, and a bootstrap script, but it does not yet have a durable app permission system. Authenticated users can reach admin navigation and admin routes based mostly on session presence, while organization-management mutations are not consistently protected by a shared authorization boundary.

This creates two problems. First, the app cannot reliably distinguish ordinary authenticated users from administrators across routes, navigation, server actions, services, and future route handlers. Second, future workflows for events, attendance, content, Groups, and Positions need a clear extension model that does not overload choir-domain concepts such as Group, Position, Member Status, Member, or Auth User as auth roles or permission groups.

## Solution

Implement a small v1 access-control system built on Better Auth's access-control primitives and wrapped by an app permission module. The v1 system uses global Access Roles and global Permission Resources for organization-management capabilities. It protects `/admin` route access with the global `admin` Access Role, hides admin navigation from non-admin users, and enforces privileged mutations inside feature write services.

The app permission module provides the shared Better Auth access-control configuration, app-shaped permission vocabulary, boolean `can*` helpers, enforcing `require*` helpers, and narrow current-actor domain predicates for future member-facing Group Membership and Position Assignment gates. Global helpers stay global; future scoped authority must use a separately named scoped permission or feature policy API.

## User Stories

1. As an ordinary authenticated member, I want admin links hidden from my navigation, so that I only see areas I can use.
2. As an ordinary authenticated member, I want `/admin` routes to be forbidden to me, so that I cannot access organization-management screens by typing a URL.
3. As an admin, I want to access `/admin` routes, so that I can manage the choir organization.
4. As an admin, I want admin navigation links to be visible, so that I can move between Members, Groups, Group Memberships, Positions, and Position Assignments.
5. As an anonymous visitor, I want protected app routes to redirect me to login, so that I can authenticate before using the app.
6. As an anonymous visitor, I want login to remain public, so that I can sign in.
7. As an authenticated non-admin user, I want authorization denial to be clearly forbidden rather than redirecting me to login, so that the app does not imply my session expired.
8. As an admin managing Members, I want member-account mutations protected by admin permissions, so that only admins can create linked Members, change Member Status, and enable or disable access.
9. As an admin managing Groups, I want Group mutations protected by admin permissions, so that only admins can create and update Groups.
10. As an admin managing Group Memberships, I want Group Membership mutations protected by admin permissions, so that only admins can create and end membership periods.
11. As an admin managing Positions, I want Position mutations protected by admin permissions, so that only admins can create and update Positions.
12. As an admin managing Position Assignments, I want Position Assignment mutations protected by admin permissions, so that only admins can create and end assignment periods.
13. As a developer adding a new organization-management mutation, I want a shared permission helper for resource/action checks, so that I do not need to know Better Auth's raw API shape.
14. As a developer adding a server action, I want the feature write service to enforce authorization, so that another caller cannot bypass the check by calling the service directly.
15. As a developer adding a route handler later, I want the same feature write service boundary to protect mutations, so that API callers and form callers follow the same authorization rule.
16. As a developer writing tests, I want unauthorized direct service calls to fail, so that privileged writes are protected outside the UI.
17. As a developer writing action tests, I want server actions to stay thin adapters, so that tests focus on parsing, delegation, revalidation, and caller-specific error translation.
18. As an operator bootstrapping an environment, I want an idempotent admin bootstrap command, so that I can create or promote the initial admin account before admin route enforcement is enabled.
19. As an operator bootstrapping an existing user, I want existing roles preserved when adding `admin`, so that bootstrap does not accidentally remove other Better Auth roles.
20. As a developer configuring Better Auth, I want one shared access-control statement and role definition, so that server and client Better Auth plugins agree on available roles and permissions.
21. As a developer, I want the app vocabulary to distinguish Access Role, Permission Resource, Permission Action, and Permission Scope, so that authorization terms do not collide with choir-domain terms.
22. As a developer, I want v1 organization-management permissions to be global, so that helper signatures do not imply unsupported per-Member, per-Group, or per-Position scoping.
23. As a developer, I want Auth User self-service account operations to stay outside organization-management permissions, so that changing one's own password is not confused with admin management.
24. As a developer building UI affordances, I want boolean `can*` helpers, so that I can hide or show controls without treating UI checks as authoritative enforcement.
25. As a developer enforcing a privileged operation, I want `require*` helpers, so that denial interrupts before a mutation or privileged Better Auth admin operation runs.
26. As a future developer building a member-facing Group resource, I want a current-actor Group Membership helper, so that current membership can authorize ordinary group-gated access without becoming a Better Auth role.
27. As a future developer building a member-facing Position resource, I want a current-actor Position Assignment helper, so that current position holding can authorize position-gated access without granting admin capabilities.
28. As a future developer composing more complex event or content policy, I want scoped authority to use a separate scoped permission or named policy API, so that optional scope fields are not bolted onto global v1 helpers.
29. As a maintainer, I want denied authorization represented by an app-level authorization error or equivalent internal signal, so that pages, actions, and future APIs can translate it appropriately.
30. As a maintainer, I want denial context structured enough for future audit logging, so that logging can be added later without redesigning authorization errors.

## Implementation Decisions

- Use Better Auth's built-in access-control primitives for v1 global roles and permissions. Define a shared access-control statement, create the access-control instance from it, derive named roles from it, and pass the same configuration to Better Auth server and client admin plugins.
- V1 Access Roles are `user` and `admin`. The global `admin` Access Role is the only v1 admin authority.
- App Permission Resources for organization-management workflows are `member`, `group`, `groupMembership`, `position`, and `positionAssignment`.
- App Permission Actions for app-owned organization resources are `read`, `create`, `update`, and `delete`. Better Auth built-in resources such as auth users and sessions keep Better Auth's action vocabulary.
- Permission Scope is global only for v1. Do not encode choir-domain Group, Position, Group Membership, Position Assignment, Member Status, Member, or Auth User as Better Auth roles or scopes.
- Keep Better Auth multi-role storage in the existing nullable role string. Multiple Better Auth roles are stored as comma-separated values. Do not remodel the role field as an enum, array, or join table while relying on the Better Auth admin plugin's role behavior.
- Add an app permission module owned by auth infrastructure. It exposes shared Better Auth configuration, typed app permission vocabulary, server-side boolean helpers, server-side enforcing helpers, and clearly non-authoritative client/UI affordance helpers where useful.
- Route policy remains owned by navigation infrastructure. It consumes session-derived facts and permission helpers but does not own global permission definitions.
- Product workflow policy remains owned by feature modules. Feature write services decide which permission helper or feature policy applies to the mutation they perform.
- Route enforcement for v1 uses proxy as the route-level enforcement boundary. Proxy should evaluate the resolved Better Auth session, not only cached session-cookie presence.
- Route access combines explicit route IDs with prefix classification. Named routes remain the canonical vocabulary for known routes, navigation, redirects, and tests. The `/admin` prefix protects future admin URLs even before they are added to navigation.
- Public routes remain explicitly listed. Ordinary app routes require authentication. Every `/admin` path requires an authenticated user with the global `admin` Access Role.
- Navigation mirrors coarse route policy as a UI affordance: anonymous users see login navigation, authenticated non-admin users see member/account routes, and authenticated admins also see admin routes.
- Server Component pages and layouts do not need to duplicate admin route checks solely for protection when proxy already enforces route policy. They may use shared helpers when they need session or user facts for rendering.
- Feature write services are the authoritative authorization boundary for product mutations, starting with the organization management write services covered by this implementation. Server actions and future route handlers are caller adapters.
- The default write path is: caller adapter validates request or form shape, feature write service requires permission, feature write service performs the mutation, and caller adapter handles revalidation, redirects, HTTP response shape, or form-state translation.
- Server actions should not normally duplicate the exact resource/action check enforced by the feature write service. Coarse early checks are allowed when they improve UX or request handling, but they must not be the only protection for a mutation.
- V1 global permission helpers should use shapes like `canCurrentUser({ resource, action })`, `requireCurrentUserPermission({ resource, action })`, `canAdmin()`, and `requireAdmin()`. Exact exported names may be adjusted during implementation, but the global helper shape must not accept choir-domain resource identity slots.
- Organization-management checks should not accept `memberId`, `groupId`, `positionId`, `positionAssignmentId`, or similar scope fields in v1.
- Unauthenticated browser page access redirects to login. Authenticated authorization denial is forbidden/403-style, not a login redirect and not not-found.
- Form-submitting server actions should not model authorization denial as a normal validation error. Denial should interrupt through the app's forbidden/error handling.
- Future API or route-handler clients should receive `401` for missing or invalid session and `403` for authenticated-but-forbidden. They should not be redirected to login.
- Denied service calls should use a distinguishable app-level authorization error type or equivalent internal signal. Next-facing adapters can translate that signal into framework forbidden behavior or HTTP status responses.
- Full audit logging is out of scope for this implementation, but denial context should be structured enough to support future audit logging.
- Admin bootstrap uses the existing admin bootstrap command as the bootstrap and recovery path. It should create a missing configured admin user or promote an existing user by adding `admin` to the comma-separated role string without removing existing roles. Existing-user promotion should not reset the password.
- Newly created member accounts continue to receive `user`. Synthetic/default auth users continue to receive `user`. Admin users are created or promoted only by the bootstrap command or by an already-authorized admin workflow.
- There is no transitional compatibility path. Environments must run the bootstrap command before enabling admin route enforcement if no user already has the `admin` Access Role.
- Current Group Membership remains a choir-domain access predicate, not a Better Auth Access Role, Permission Scope, or permission grant. Future member-facing group resources may use narrow current-actor helpers such as `canCurrentUserInGroup` and `requireCurrentUserInGroup`.
- Group Membership helper checks evaluate current membership at permission-check time. They should derive the current Auth User and linked Member from request/session context. They should not accept `memberId`, should not accept an `at` input, should not include an admin override in v1, and should not require Member Status to be active.
- Current Position Assignment remains a choir-domain access predicate, not a Better Auth Access Role, Permission Scope, or Permission Resource grant. Future member-facing position resources may use narrow current-actor helpers such as `canCurrentUserHoldPosition` and `requireCurrentUserHoldsPosition`.
- Position Assignment helper checks answer whether the current linked Member currently holds a specific Position through an active Position Assignment at permission-check time. Position Scope and Group Membership do not participate inside this helper.
- Holding a Position does not grant organization-management or admin capabilities. Those remain governed by Better Auth global roles and app Permission Resources.
- Historical relationship checks, such as whether the current Member ever held a Position or ever belonged to a Group, are product predicates rather than v1 authorization gates.
- Future access-control extensions follow three explicit paths: add global Permission Resource/action pairs, add narrow current-actor domain predicates, or introduce a separately named scoped permission or feature policy API.
- Future scoped or delegated authority must not be added by placing optional scope fields such as `groupId`, `memberId`, or `eventId` onto the v1 global permission helper. Scoped authority needs an explicit scope concept or a named feature policy helper.

## Testing Decisions

- Tests should cover external behavior through module interfaces rather than implementation details. A useful authorization test proves whether a caller is allowed or denied at the boundary that matters, not whether a private helper was invoked.
- The primary new test seam is the app permission module's public helper interface. Tests should cover global admin permission checks, plain user denial, unauthenticated denial, Better Auth role-string behavior where the module owns it, and the distinction between boolean `can*` helpers and enforcing `require*` helpers.
- Better Auth configuration tests should prove the server and client admin plugin setup use the shared access-control definitions and preserve the existing public-registration expectations.
- Route/navigation tests should cover route classification and route decisions for public, authenticated, admin, and future `/admin` paths. They should also cover anonymous, non-admin authenticated, and admin navigation visibility.
- Proxy tests should exercise the proxy-facing route decision seam, including the move from cached-cookie-only authentication to resolved session facts where practical.
- Feature write service tests are the authoritative mutation authorization tests. Starting with organization management, service tests should prove unauthenticated/non-admin callers are rejected before mutations or privileged Better Auth admin operations, and admins are allowed.
- Server action tests should remain thin adapter tests. They should continue to cover form parsing, service delegation, revalidation, redirect/response behavior, and known error translation. They should not duplicate every resource/action authorization matrix already covered at the feature write service boundary.
- Bootstrap tests should cover missing-user creation, existing-user promotion, role preservation, role normalization, configured email normalization, and password requirements for new-user creation.
- Existing test patterns to follow include navigation policy tests, auth option tests, feature action tests, account service tests, and organization core behavior tests.

## Out of Scope

- Replacing Better Auth with a custom authorization provider.
- Reworking choir-domain Group, Position, Member Status, Member, or Auth User into permission primitives.
- Adding resource-scoped organization-management permissions in v1.
- Adding optional choir-domain identity fields to the v1 global permission helper.
- Building full audit logging for denied authorization attempts.
- Creating a generic event, attendance, content, or document permission system now.
- Adding admin override behavior to strict current Group Membership or Position Assignment helpers.
- Treating historical Group Membership or Position Assignment as current authorization authority.
- Changing account self-service authorization such as changing one's own password.
- Remodeling Better Auth role storage away from the existing role string.

## Further Notes

- This specification is the implementation handoff from the completed access-control wayfinder map. The linked map remains the detailed decision history.
- The implementation should proceed from shared permission definitions to route/navigation enforcement and then feature write service enforcement. This avoids a temporary state where UI affordances change while services remain directly callable without authorization.
- Use the repo glossary vocabulary exactly: Group is not a permission group, Position is not a permission, Member Status is not an auth role, and Auth User is not the canonical choir Member profile.

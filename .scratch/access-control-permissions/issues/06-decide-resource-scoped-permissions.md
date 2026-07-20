# Decide resource-scoped permissions

Type: grilling
Status: resolved
Blocked by: 01, 03, 05
Parent: ../map.md

## Question

Which v1 permissions are purely global and which need resource context such as a Member, Group, Position, or Position Assignment?

This should decide whether helpers like `permissions.canUserEditResource(...)` are needed now, what resource identity they accept, and how they avoid coupling Better Auth roles to choir-domain Groups or Positions prematurely.

## Answer

CSK Choir Hub v1 permissions are global only. Organization-management checks should ask for a Permission Resource and Permission Action, such as `{ resource: "member", action: "update" }`, plus the current actor/session context owned by the permission helper. They should not accept `memberId`, `groupId`, `positionId`, `positionAssignmentId`, or other choir-domain resource identity slots in v1.

The v1 helper interface should therefore avoid generic resource-scoped names such as `canUserEditResource(...)` or nullable context shapes that imply scoped enforcement exists. Use global helper names and request shapes instead, such as `canCurrentUser({ resource, action })`, `requireCurrentUserPermission({ resource, action })`, `canAdmin()`, and `requireAdmin()`, with exact naming left to the implementation pass.

This keeps Better Auth Access Roles and Permission Scopes separate from choir-domain Groups, Positions, Members, Group Memberships, and Position Assignments. The global `admin` Access Role can manage all organization-management resources in v1; the global `user` Access Role cannot perform admin organization-management mutations merely because the affected resource is their own Member, Group, Position, or assignment.

Self-service Auth User and account operations, such as changing one's own password or account settings, stay outside this organization-management permission model. They belong to the account/auth self-service workflow. Admin management of Auth Users and Members remains protected by global admin permissions.

Future resource-scoped or group-gated access can be added later as a distinct decision and API shape. It should introduce explicit scoped permission concepts or post-permission predicates rather than retrofitting optional identity fields into the v1 global helper signature.

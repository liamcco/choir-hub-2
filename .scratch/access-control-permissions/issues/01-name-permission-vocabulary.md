# Name the permission vocabulary

Type: grilling
Status: resolved
Blocked by:
Parent: ../map.md

## Question

What are the canonical permission resources, actions, roles, and scopes for CSK Choir Hub v1, and how should those names relate to existing domain terms without overloading Group, Position, Member Status, or Auth User?

This decision should produce the first vocabulary that later tickets use when discussing `permissions.requireAdmin()`, `permissions.requireRole(...)`, route access, and resource/action checks.

## Answer

CSK Choir Hub v1 should use a deliberately small, global Better Auth role/permission vocabulary:

- Access roles: `user` and `admin`.
- Permission resources: `member`, `group`, `groupMembership`, `position`, and `positionAssignment` for organization-management workflows, plus Better Auth's built-in `user` and `session` resources for auth-admin operations.
- Permission actions: `read`, `create`, `update`, and `delete` for app-owned organization resources. Better Auth's built-in resources keep their own action names, such as ban, impersonation, or session revocation actions, rather than forcing them into the app CRUD vocabulary.
- Permission scope: global only for v1. Do not encode choir-domain Group, Position, Group Membership, Position Assignment, or Member Status as auth roles/scopes.

The naming boundary is intentional: `Group`, `Position`, `Member Status`, `Member`, and `Auth User` keep their glossary meanings. Authorization terms should be named as `Access Role`, `Permission Resource`, `Permission Action`, and `Permission Scope` when discussing the model generically.

This v1 vocabulary should remain extensible. Future workflows may add resources, actions, or scoped permission checks, but those extensions should be additive and explicitly decided later. They should not overload choir-domain Groups or Positions by default.

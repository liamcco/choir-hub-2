# Access control permission system

Labels: wayfinder:map

## Destination

Produce a durable access-control specification for CSK Choir Hub: the Better Auth role/scope setup, the app permission module interface, and the route/action/service enforcement model are clear enough for implementation without further architectural decisions.

## Notes

Use the repo glossary in `CONTEXT.md`: Auth User, Member, Group, Position, and related organization concepts have specific meanings. In particular, Group is not a permission group, Position is not a permission, and Member Status is not an auth role.

Consult `docs/codebase-structure.md` before deciding module placement. Current ownership suggests Better Auth setup lives in `src/core/auth`, route access decisions live in `src/core/navigation`, and product workflows stay in `src/features`.

Base the permission model on Better Auth's built-in access control primitives where possible. The installed Better Auth package exposes `createAccessControl`, `role`, and admin plugin role permission checks, but exact project usage needs confirmation before implementation.

Wayfinding is planning only for this effort. Do not implement the permission module while resolving this map unless the destination is explicitly redrawn.

## Decisions so far

- [Name the permission vocabulary](issues/01-name-permission-vocabulary.md) — v1 uses global `user`/`admin` Access Roles with app Permission Resources for organization-management entities and CRUD-style actions, while leaving future scoped extensions additive and separate from choir Groups, Positions, and Member Status.
- [Research Better Auth access-control integration](issues/02-research-better-auth-access-control.md) — installed Better Auth supports a shared `createAccessControl`/`ac.newRole` setup wired into both server and client admin plugins, with multi-role values stored as comma-separated strings in `User.role`.
- [Place the permission module](issues/03-place-the-permission-module.md) — the app permission module belongs in `src/core/auth/permissions`, exporting shared Better Auth access-control config plus app-shaped check helpers while leaving route policy in navigation and workflow policy in features.
- [Decide route enforcement model](issues/04-decide-route-enforcement-model.md) — proxy is the route-level enforcement boundary using `auth.api.getSession()` facts; `/admin` routes require the global `admin` Access Role, and navigation hides admin links from non-admin users.
- [Decide action and service enforcement model](issues/05-decide-action-and-service-enforcement-model.md) — feature write services are the authoritative authorization boundary for product mutations, while server actions and route handlers stay as caller adapters with optional coarse early checks.
- [Decide resource-scoped permissions](issues/06-decide-resource-scoped-permissions.md) — v1 organization-management permission checks stay global, with no choir-domain resource identity slots in helper signatures; scoped access remains a future explicit API.
- [Decide denial semantics](issues/07-decide-denial-semantics.md) — unauthenticated browser access redirects to login, authenticated denial is forbidden/403-style, `require*` helpers interrupt, and `can*` helpers stay advisory.
- [Decide bootstrap and migration](issues/08-decide-bootstrap-and-migration.md) — rollout relies on explicit `admin` role bootstrap with no transitional compatibility path, then layers shared permissions, route enforcement, navigation hiding, and service authorization in order.
- [Decide Group Membership gated resources](issues/09-decide-group-membership-gated-resources.md) — current Group Membership can authorize ordinary member-facing group resources through narrow current-actor helpers, without Better Auth scopes, admin override, `at` input, or Member Status coupling.
- [Decide future permission extension rules](issues/10-decide-future-permission-extension-rules.md) — future extensions must choose global permissions, narrow current-actor domain predicates, or an explicit scoped/named policy API rather than adding optional scope fields to v1 global helpers.
- [Decide Position Assignment gated resources](issues/11-decide-position-assignment-gated-resources.md) — current Position Assignment can authorize ordinary member-facing position resources through narrow current-actor helpers, while historical relationship checks stay separate boolean domain predicates.

## Not yet specified


## Out of scope

- Building the access-control implementation in this map. This effort ends when the decisions are clear enough to hand off.
- Replacing Better Auth with a custom authorization provider.
- Reworking the choir-domain Group or Position models into permission primitives.

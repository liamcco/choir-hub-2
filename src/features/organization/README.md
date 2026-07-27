# Organization feature

The organization feature owns CSK's organization-domain workflows: Choirs, Sections, Groups, Positions, Users, dated memberships, and dated assignments.

## Public modules

- `@/features/organization`: organization-domain services, errors, labels, and shared formatters.
- `@/features/organization/management`: the admin management screens and workflow entrypoints.
- `@/features/organization/management/groups`: Group collection/detail screens and Group Membership controls.
- `@/features/organization/management/members`: User collection/detail/create screens and member actions.
- `@/features/organization/management/positions`: Position collection/detail screens and focused Position reads.
- `@/features/organization/management/placement`: Placement navigation, roster, User detail, status, and transfer workflows.
- `@/features/organization/management/group-memberships`: Group Membership actions, forms, focused reads, and pure relationship transformations.
- `@/features/organization/management/position-assignments`: Position Assignment actions, forms, focused reads, and pure relationship transformations.

Use the focused reads when a Server Component needs one collection, option list, or dated relationship view. Client Components should receive the resulting slice as props and should not read persistence or topology directly.

## Internal map

- `core/` contains domain services, validation, errors, and labels.
- `management/` contains admin workflows and their screen-specific reads and UI.
- `@/core/topology` is the sole source of truth for the Permanent Organization Topology. Raw route/form strings must be resolved there before entering domain logic.

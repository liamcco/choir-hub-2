# Decide future permission extension rules

Type: grilling
Status: resolved
Blocked by: 05, 06, 09, 11
Parent: ../map.md

## Question

How should the v1 access-control spec leave room for future event, attendance, content, and group-gated workflows to add permission resources, actions, or scopes without overloading choir-domain Group, Position, Member Status, or Auth User?

This should decide the extension rule later implementers follow when adding new Permission Resources or scoped permission checks after v1, while keeping the initial v1 vocabulary global and small.

## Answer

Future access-control extensions should choose one of three explicit paths instead of overloading choir-domain `Group`, `Position`, `Member Status`, or `Auth User` as permission primitives.

1. New global admin-style capabilities add Better Auth-backed app `Permission Resource` and action pairs. These stay in the v1 global permission shape, such as `requireCurrentUserPermission({ resource, action })`, and continue to mean "does the current Auth User's global Access Role grant this app permission?"
2. Ordinary member-facing access uses narrow current-actor domain predicates, such as `requireCurrentUserInGroup({ groupId })` or `requireCurrentUserHoldsPosition({ positionId })`. These helpers may authorize access by current Group Membership or current Position Assignment after authentication and linked-Member lookup, but they are not Better Auth scopes, Access Roles, or generic permission grants.
3. True scoped or delegated authority introduces a new explicit scoped permission or named policy API. It must not be added by placing optional `groupId`, `memberId`, `eventId`, or similar scope fields onto the v1 global helper.

A future scoped API should make the boundary visible in the type shape, for example:

```ts
requireCurrentUserScopedPermission({
  resource: "event",
  action: "manage",
  scope: {
    kind: "group",
    groupId,
  },
})
```

For workflows whose policy is domain-specific, a named helper such as `requireCurrentUserCanManageEvent({ eventId })` is also acceptable. That helper may compose delegated event permissions, current Group Membership, current Position Assignment, global admin override, or other predicates, but the composition should be owned by the feature policy rather than hidden inside a generic global permission check.

The extension rule is therefore: global permission helpers stay global; domain relationship helpers stay narrow and current-actor focused; scoped authority gets a separately named API with an explicit scope concept or a feature-specific policy helper. Choir-domain objects can be inputs to those policies, but they do not become permission groups, auth roles, or member statuses.

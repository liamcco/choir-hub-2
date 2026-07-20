# Decide Position Assignment gated resources

Type: grilling
Status: resolved
Blocked by: 01, 03, 05, 06, 09
Parent: ../map.md

## Question

Should the permission module expose current Position Assignment helpers similar to `requireCurrentUserInGroup({ groupId })`, such as `requireCurrentUserHasPosition({ positionId })`, and what exact domain predicate should they evaluate?

Resolve whether Position Assignment can authorize ordinary member-facing position-gated resources by itself after authentication and linked-Member lookup, whether the check is only for the current holder at permission-check time, whether Position Scope or Group Membership should participate, and whether the helper should stay separate from Better Auth Access Roles, Permission Scopes, and Permission Resources.

## Answer

Current Position Assignment can authorize ordinary member-facing position-gated resources by itself after authentication and linked-Member lookup. This is a choir-domain predicate, not a Better Auth Access Role, Permission Scope, or Permission Resource grant.

The v1 permission module may expose narrow current-actor helpers such as:

```ts
canCurrentUserHoldPosition({ positionId })
requireCurrentUserHoldsPosition({ positionId })
```

Exact names can be adjusted during implementation, but the helper contract should stay focused on the current actor and a specific `Position`. The predicate is: does the current linked `Member` currently hold this `Position` through an active Position Assignment at permission-check time?

`Position Scope` should not participate inside this helper. Callers may use Position Scope to decide which `positionId` is relevant for a workflow, but the helper itself should not answer whether a Position applies to a Group or resource context. Group Membership should likewise stay separate unless a future workflow explicitly composes both predicates at the feature layer.

Holding a Position does not grant organization-management or admin capabilities such as editing Members, Groups, Positions, or Position Assignments. Those capabilities remain governed by Better Auth global roles and app Permission Resources.

Historical relationship checks are useful but should stay distinct from authorization gates. Separate domain/query helpers may answer questions such as:

```ts
hasCurrentUserEverHeldPosition({ positionId })
hasCurrentUserEverBelongedToGroup({ groupId })
```

Those helpers should be boolean predicates for product eligibility, archive visibility, filtering, or workflow-specific decisions. They should not be modeled as v1 permission-module `require...` authorization gates, because past authority should not look interchangeable with present authority.

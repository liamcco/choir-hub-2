# Decide Group Membership gated resources

Type: grilling
Status: resolved
Blocked by: 01, 03, 05, 06
Parent: ../map.md

## Question

How should the permission module evaluate resources that are available only to members of specific Groups, such as future boards, chat rooms, event spaces, or document areas?

Resolve the boundary between Better Auth roles/scopes and choir-domain Group Membership. In particular, decide whether Group Membership is an additional resource predicate checked after role/scope authorization, whether it can grant access by itself, what date should be used for membership checks, and what caller input a helper such as `permissions.canUserAccessResource(...)` should receive.

## Answer

Group Membership remains a choir-domain access predicate, not a Better Auth Access Role, Permission Scope, or permission grant. Better Auth roles/scopes stay responsible for global admin-style capabilities; Group Membership answers the product-domain question of whether the current Member belongs to a specific Group.

For ordinary member-facing group resources, current Group Membership is sufficient authorization by itself after authentication and linked-Member lookup. The permission module may expose narrow helpers such as:

```ts
requireCurrentUserInGroup({ groupId })
canCurrentUserInGroup({ groupId })
```

Those helpers should derive the current Auth User and linked Member from the request/session context. Normal request-path callers should not pass `memberId`, because the check is specifically about the current actor.

The check always evaluates current membership at permission-check time. Do not include an `at` input in this helper; dated membership history remains a domain capability, but permission checks should ask whether the actor is in the Group now.

The helper should not include an admin override in v1. If a future workflow needs an admin override, it should use a separately named policy helper rather than hiding that behavior inside the strict group-membership helper.

The helper should not require `Member Status = active`. Member Status is independent of Group Membership; a future active-member guard, if needed, should be modeled as a separate helper such as `requireActiveCurrentUser(...)`, not as part of group checks.

# Restrict User Impersonation to the Admin Access Role

## Status

Accepted

## Context

The User detail view needs to let administrators inspect the application as another User. Better Auth's admin plugin provides the impersonation mechanism, while CSK's authorization model keeps the global `admin` Access Role separate from choir-domain Groups, Positions, and Member Status.

Impersonation changes the effective login identity and therefore needs a single, explicit authorization boundary. Allowing domain membership or status to grant it would blur the distinction between Access Roles and choir relationships.

## Decision

Only a User with the global `admin` Access Role may start User impersonation. The permission must be enforced by the server-side action/API; hiding the control in the User detail view is only presentation.

The Better Auth default that prevents impersonating Users with the `admin` Access Role remains in force. Starting impersonation requires no confirmation dialog. While an impersonation session is active, the normal logout control is presented as `Stop impersonating`, and a small non-interactive banner identifies the impersonated User; the banner does not contain a stop action.

The User detail view omits the impersonation control for admin Users rather than presenting an action that the server will reject.

## Consequences

- The impersonation control is available only to admins.
- Group Membership, Position Assignment, Member Status, and other choir-domain relationships do not grant impersonation.
- Better Auth remains the authority for creating and tracking the impersonated session.
- Admins cannot impersonate other admins unless a later decision explicitly grants the `impersonate-admins` permission.
- The active-session exit affordance stays in the existing logout location; the identity banner is informational only.
- Starting impersonation is intentionally a one-click action from the User detail view.
- Admin targets are identified in the detail read model so the UI can omit the unavailable action.

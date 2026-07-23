# CSK Choir Hub

CSK Choir Hub is an internal choir platform for coordinating members, organizational groups, events, attendance, internal information, and future choir operations.

## Language

**Group**:
A durable organizational unit in the choir, such as the choir, a voice section, a committee, a board, or a project group. Groups are the backbone for standing membership structure; events, attendance lists, permissions, and temporary derived cohorts are separate concepts that may reference groups.
_Avoid_: Container, cohort, event list, permission group

**Group Kind**:
A fixed v1 classification for a Group, used when product behavior or navigation needs to distinguish choirs, sections, committees, boards, and projects.
_Avoid_: User-defined group type, tag

**User**:
A person represented in the choir domain and their login identity, managed by Better Auth. Every User is a choir person from creation and has one overall status, regardless of how many Groups they belong to.
_Avoid_: Auth User, Member, account

**Member Status**:
A User's overall relationship to the choir organization, currently active, passive, or former. Member Status is independent of Group Membership history, login state, and authorization.
_Avoid_: User status, Group Membership status, auth role

**Group Membership**:
A dated record that a User belongs to a Group for a period of time. Group Membership has no separate status; whether a User belongs to a Group is determined by its dates.
_Avoid_: Current-only group link, group membership status

**Voice**:
A User's current Group Membership in a Group of kind Section. Administrators normally keep one current Voice per User, but the domain does not enforce that limit.
_Avoid_: Voice Group Kind, enforced voice assignment

**Position**:
A durable choir office or role that may be relevant to one or more Groups and can be held by only one User at a time. Position names are display text and are not globally unique; two different scoped Positions may share the same name.
_Avoid_: Permission, title, per-group role

**Position Scope**:
The relationship between a Position and the Groups where that Position has standing relevance.
_Avoid_: Position ownership

**Position Assignment**:
A dated record that a User held a Position for a period of time. Position Assignment history is kept so the platform can answer who held a position at a past date.
_Avoid_: Current holder field

**Access Role**:
A Better Auth-backed global authorization role assigned to a User by the app's auth system. In v1, Access Roles are intentionally separate from choir Groups, Positions, and Member Status.
_Avoid_: Group, Position, Member Status

**Permission Resource**:
A Better Auth-backed authorization resource name used by the app permission system to protect an application area. Permission Resources may use the same words as choir-domain entities when they protect those areas, but they are not the entities themselves.
_Avoid_: Group, Position, Member Status

**Permission Scope**:
The Better Auth-backed authorization boundary within which an Access Role grants a permission. In v1, Permission Scopes are global; future scoped permissions must remain distinct from choir Groups and Positions unless a later decision explicitly changes that boundary.
_Avoid_: Group, Position Scope

**Audit Event**:
A security-relevant record of an attempted or completed action, retained to support operational investigation and accountability. Audit Events identify the actor when available, the action, and the affected subject by stable identifiers, without recording credentials, secrets, or raw request data.
_Avoid_: Debug log, application error

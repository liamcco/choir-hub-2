# CSK Choir Hub

CSK Choir Hub is an internal choir platform for coordinating members, organizational groups, events, attendance, internal information, and future choir operations.

## Language

**Group**:
A durable organizational unit in the choir, such as the choir, a voice section, a committee, a board, or a project group. Groups are the backbone for standing membership structure; events, attendance lists, permissions, and temporary derived cohorts are separate concepts that may reference groups.
_Avoid_: Container, cohort, event list, permission group

**Group Kind**:
A fixed v1 classification for a Group, used when product behavior or navigation needs to distinguish choirs, sections, committees, boards, and projects.
_Avoid_: User-defined group type, tag

**Member**:
A person represented in the choir domain. In v1, each Member is backed by exactly one auth User and has one overall membership status, regardless of how many choirs or other Groups they belong to.
_Avoid_: Auth user, account

**Member Status**:
A Member's overall relationship to the choir organization, currently active, passive, or former. Member Status is independent of Group Membership history.
_Avoid_: Group membership status, auth role

**Group Membership**:
A dated record that a Member belongs to a Group for a period of time. Group Membership has no separate status; whether a Member belongs to a Group is determined by its dates.
_Avoid_: Current-only group link, group membership status

**Position**:
A durable choir office or role that may be relevant to one or more Groups and can be held by only one Member at a time. Position names are display text and are not globally unique; two different scoped Positions may share the same name.
_Avoid_: Permission, title, per-group role

**Position Scope**:
The relationship between a Position and the Groups where that Position has standing relevance.
_Avoid_: Position ownership

**Position Assignment**:
A dated record that a Member held a Position for a period of time. Position Assignment history is kept so the platform can answer who held a position at a past date.
_Avoid_: Current holder field

**Auth User**:
A login identity managed by the authentication system. Auth Users handle credentials, sessions, roles, bans, two-factor authentication, and passkeys; they are not the canonical choir member profile.
_Avoid_: Member, singer

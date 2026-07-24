# Separate resource Audience from authorization

CSK Choir Hub will model the Users allowed to view a resource as its Audience, separately from authorization governing who may create, edit, or administer that resource. Choir, Section, Voice Type, and Group relationships may inform content visibility without becoming Better Auth roles or administrative Permission Scopes.

This prevents organizational and musical targeting such as “MK T1” or “bass singers” from being conflated with security roles and resource-management privileges.

Audience rules reference the relevant first-class relationship directly rather than creating synthetic access Groups. In particular, current Effective Group Membership—whether explicit or Position-derived—may grant visibility to a committee, webmaster body, or the Board, alongside targets based on Home Choir, Section Placement, Voice Type, or Project Ensemble participation.

For v1, Voice Type Audiences derive from current Section Placement. Capability-based Audiences are a distinct but deferred concept; v1 may combine placement categories such as SA or TB without introducing capability targeting.

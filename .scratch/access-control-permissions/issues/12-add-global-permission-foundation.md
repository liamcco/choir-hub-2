# 12 — Add global permission foundation

**What to build:** the app has a shared permission module wired into Better Auth, with `user`/`admin` Access Roles, organization-management Permission Resources/actions, server-side `can*`/`require*` helpers, a distinguishable authorization-denial signal, and tests proving admin/plain-user/unauthenticated behavior.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Better Auth server and client admin plugin setup use the same shared access-control definitions.
- [ ] The app permission module exposes the v1 Access Role, Permission Resource, Permission Action, and global permission request vocabulary.
- [ ] Server-side boolean helpers return allow/deny results for admin, plain user, and unauthenticated current actors.
- [ ] Server-side enforcing helpers interrupt with a distinguishable app-level authorization denial signal.
- [ ] V1 global permission helpers do not accept choir-domain scope fields such as Member, Group, Position, Group Membership, or Position Assignment identifiers.
- [ ] Existing auth configuration expectations, including disabled public email/password self-registration, remain covered by tests.

# Unify Users and choir identity

CSK Choir Hub will use Better Auth's `User` as the sole person and account entity. Every User is a choir person at creation with `MemberStatus.ACTIVE`; Group Memberships and Position Assignments reference that User directly, and no account-linking workflow exists. `MemberStatus` remains a choir-domain classification, independent of login state and Access Roles.

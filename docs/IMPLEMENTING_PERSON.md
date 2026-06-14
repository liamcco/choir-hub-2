# People and Profiles

## Summary

Use Better Auth for users, sessions, admin role, passkeys, username, OTP, and related authentication features.

The Better Auth `User` model is also the application person record. Domain relations such as memberships and positions attach to that same user row.

## Model

- User: application profile representing a choir member and managed by Better Auth.
- User.id: primary key created by Better Auth and referenced by domain tables.
- User.role: Better Auth admin plugin role used for admin authorization.

## Behavior

- Global Better Auth admins can manage people.
- Admins create Better Auth users through the admin API.
- There is no self-service signup flow.
- Every authenticated user is represented by a `User` row.
- Admin API routes require `user.role === "admin"`.

## Tests

- Creating a user creates a Better Auth `User` row.
- Admin user creation skips existing emails and reports failed rows.
- Admin-only people endpoints reject authenticated non-admin users.

## Assumptions

- Users and people are created together by administrators.

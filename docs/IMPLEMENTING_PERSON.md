# People and Profiles

## Summary

Use Better Auth only for users, sessions, admin role, passkeys, username, OTP, and related authentication features.

Model choir members in the application schema using a separate `User` table.

## Model

- User: application profile representing a choir member. It exists separately from Better Auth so application data is not tightly coupled to the authentication implementation.
- User.id: primary key shared with Better Auth User.id (1:1 relationship).
- Every Better Auth User has exactly one corresponding User.
- Every User has exactly one corresponding Better Auth User.

## Behavior

- Global Better Auth admins can manage people.
- Admins create Better Auth users and corresponding User records together as part of the same workflow.
- There is no self-service signup flow.
- Every authenticated user has a corresponding `User`.
- No application-level authorization is implemented in this phase. Authentication alone is sufficient to access protected features.

## Tests

- Createing creates both a Better Auth User and a corresponding User.
- User.id matches the corresponding Better Auth User.id.
- Createing is atomic; neither record can exist without the other.

## Assumptions

- Every Better Auth user has exactly one corresponding User with the same id.
- Every User has exactly one corresponding Better Auth user with the same id.
- Users and people are created together by administrators.

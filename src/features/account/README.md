# Account feature

The account feature owns authentication-facing workflows for login and user self-service.

## Public modules

- `@/features/account/login`: the login screen and login service used by the account route.
- `@/features/account/self-service`: password-change and other authenticated self-service screens, actions, and services.

Use these modules from route composition or account-facing screens. Keep Better Auth infrastructure in `@/core/auth`; this feature owns the user workflow and presentation around it.

## Internal map

- `login/` contains login UI and its server-side authentication workflow.
- `self-service/` contains authenticated account changes, forms, schemas, and services.

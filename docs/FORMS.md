# Forms

## Choose the right pattern

### 1) Simple auth/server forms

Use `useActionState` + server action for straightforward submissions.

Example: `src/app/(auth)/login/login-form.tsx` + `src/app/(auth)/login/actions.ts`

### 2) Rich interactive forms

Use TanStack Form for field-level state/validation and TanStack Query for mutation handling.

Example: `src/app/admin/groups/create/CreateGroupCard.tsx`

## Validation

- Define schemas with Zod.
- Validate on submit at minimum.
- Surface field and form errors in UI.

## Submission behavior

- Disable submit while pending.
- Show clear success/error states.
- Normalize optional fields before API calls (`""` -> `undefined` when needed).

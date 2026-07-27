# Make User Onboarding a recoverable partial-success workflow

## Decision

User Onboarding processes one or more normalized onboarding plans sequentially. Predictable validation errors prevent the batch from writing anything; failures discovered while processing a row affect only that row. A successfully created User is retained even when activation-link delivery fails.

When a row fails after Better Auth has created its User, User Onboarding attempts to remove that User. If removal fails, the row result identifies the surviving User and the failure is written with the normal Error-level logger. Activation-link failures are non-fatal and can be retried through the existing User Detail workflow.

Manual User creation submits one onboarding plan, so it uses the same lifecycle as CSV import without requiring a separate creation path or temporary password.

## Rationale

Better Auth account creation, database relationship writes, and email delivery cannot share one atomic transaction. Treating the whole batch as atomic would require deleting successful Users when an unrelated row or email fails, while best-effort rollback can itself fail. Per-row results make the actual lifecycle explicit and keep successful work stable.

All initial Choir Membership and Section Placement writes go through their canonical application modules. This preserves relationship validation and the Section Placement to Voice Capability invariant.

## Consequences

- The onboarding interface returns per-row outcomes alongside validation errors.
- Import and manual creation share validation, compensation, activation-link delivery, and User-level auditing.
- The import action remains responsible only for the batch summary and screen revalidation.
- No persistent batch record is introduced yet; the returned result is the operational record for the current request.
- Cleanup failures require operational follow-up because the surviving User may have no intended organizational relationships.

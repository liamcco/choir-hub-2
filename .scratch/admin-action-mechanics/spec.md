# Admin Action Mechanics

Status: ready-for-agent

## Problem Statement

Several admin Server Function modules repeat action mechanics: reading form fields, normalizing optional strings, parsing dates, mapping validation errors to form state, requiring an admin actor, and revalidating the route after successful writes.

Some duplication is acceptable while concepts are unclear, but the dated-history and management actions are now similar enough that future admin surfaces will likely copy the same shallow action implementation.

## Solution

Introduce a small admin action mechanics module for recurring Server Function behavior. The module should improve locality for action plumbing while keeping each workflow module responsible for domain-specific input construction, validation errors, and write operations.

Server Function authorization must remain explicit and robust. This module should not replace workflow authorization or Proxy protection.

## User Stories

1. As an admin, I want form submissions to keep returning clear validation feedback, so that I can correct mistakes quickly.
2. As an admin, I want successful writes to refresh the relevant management route, so that I see updated data.
3. As an admin, I want date field behavior to be consistent across dated admin forms, so that period workflows are predictable.
4. As a future developer, I want common action mechanics behind one interface, so that new admin actions avoid copy-paste.
5. As a future developer, I want domain-specific action input shapes to stay local, so that the helper does not become a broad framework.
6. As a future developer, I want authorization checks to remain visible at the action seam, so that write protection is not accidental.
7. As a future developer, I want revalidation behavior to be easy to declare, so that routes refresh consistently.
8. As a future developer, I want field-error mapping to concentrate, so that form state behavior is consistent.
9. As a maintainer, I want tests to cover action mechanics once, so that duplicated tests do not grow with each admin workflow.
10. As a maintainer, I want existing action behavior preserved, so that architecture cleanup does not alter product workflows.

## Implementation Decisions

- Build a small helper module for recurring admin Server Function mechanics.
- Keep workflow modules responsible for their own domain input shape.
- Keep workflow modules responsible for calling their own write methods.
- Keep actor requirements explicit and backed by existing admin access policy behavior.
- Share date parsing only where form behavior is identical.
- Share optional string normalization only where semantics are identical.
- Share field-error extraction and result construction where form state shapes align.
- Share route revalidation helpers where route paths can be declared without spreading string literals.
- Do not make a broad generic form framework.
- Do not change Server Function authorization semantics.

## Testing Decisions

- Test helper behavior through its public interface.
- Preserve existing action tests for representative workflows.
- Add or adjust action tests only where shared mechanics could change externally visible form behavior.
- Do not assert implementation order unless it is externally observable.

## Out of Scope

- Replacing workflow services.
- Changing form UI.
- Changing validation messages unless needed to preserve current behavior.
- Changing route URLs.
- Changing Proxy or page route protection.
- Adding optimistic UI.

## Further Notes

- This spec should probably follow dated-period presentation or route access cleanup, because date parsing and route path locality may be affected by those decisions.


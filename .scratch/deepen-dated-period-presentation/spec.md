# Deepen Dated-Period Presentation

Status: ready-for-agent

## Problem Statement

Group Membership and Position Assignment workflows both present dated history. Their screens and actions repeat similar implementation patterns: date parsing, current/historical grouping, optional scheduled grouping, empty states, two-axis views by Member and by target, end-period forms, and period table rendering.

The domain concepts are distinct and should stay distinct, but the repeated dated-period implementation reduces glancability and will become a larger problem when future modules such as Attendance or Events introduce more dated records.

## Solution

Deepen a dated-period presentation module that absorbs recurring dated-history UI and action mechanics while preserving Group Membership and Position Assignment domain language at the feature module interfaces.

The module should provide leverage for period buckets, date display, empty states, and reusable history table structure. Feature modules should still own their workflow-specific inputs, actions, validation errors, and labels where those labels express choir-domain meaning.

## User Stories

1. As an admin, I want Group Membership periods to display clearly, so that I can understand current and historical Group Membership.
2. As an admin, I want Position Assignment periods to display clearly, so that I can understand current and historical Position holders.
3. As an admin, I want empty dated-history states to be consistent, so that screens feel coherent.
4. As an admin, I want date fields to behave consistently, so that ending memberships and assignments is predictable.
5. As a future developer, I want period table implementation to live behind one interface, so that dated-history screens stay glancable.
6. As a future developer, I want Group Membership and Position Assignment vocabulary preserved, so that the dated-period module does not erase domain meaning.
7. As a future developer, I want future Attendance and Event dated records to reuse proven period presentation, so that new dated workflows get leverage.
8. As a future developer, I want date parsing mechanics to concentrate, so that date behavior changes do not spread across actions.
9. As a future developer, I want feature modules to keep their own workflow validation, so that domain-specific errors remain local.
10. As a maintainer, I want tests to cover dated-period behavior once where possible, so that duplicated test setup does not grow with every dated screen.

## Implementation Decisions

- Build a dated-period presentation module only for recurring mechanics with a stable interface.
- Preserve Group Membership and Position Assignment as separate workflow modules.
- Keep domain-specific labels and workflow-specific input shapes in their feature modules unless they become genuinely shared.
- Include current and historical period display behavior in the shared module.
- Include scheduled period display only if the interface can express it without forcing all workflows to support scheduled periods.
- Share empty state and period table structure where it improves locality.
- Share action date parsing only if it can be done without hiding domain-specific validation semantics.
- Do not change dated-history domain invariants.
- Do not change Prisma schema.

## Testing Decisions

- Test dated-period presentation behavior through the new module interface.
- Keep feature screen tests focused on meaningful workflow rendering, not table implementation details.
- Preserve existing workflow service tests for Group Membership and Position Assignment invariants.
- Add representative feature integration coverage only where feature-specific labels or buckets are easy to wire incorrectly.
- Avoid snapshot-style tests of incidental markup.

## Out of Scope

- Changing Group Membership or Position Assignment semantics.
- Changing overlap detection.
- Changing database schema.
- Adding Attendance or Events.
- Refactoring admin route composition.
- Rewriting entire screens into tiny mechanical fragments.

## Further Notes

- The deletion test should guide extraction: if deleting a local module would only move code within one screen, keep it local; if it would spread period mechanics back into multiple workflows, it belongs in the dated-period module.


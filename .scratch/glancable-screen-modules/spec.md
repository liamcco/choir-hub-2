# Glancable Screen Modules

Status: ready-for-agent

## Problem Statement

The largest hand-written screen modules are still coherent, but they are approaching the point where page-level layout, repeated sections, tables, formatting, and empty states make them less glancable. The user prefers smaller files that can be scanned quickly.

Blindly splitting JSX into tiny fragments would make the codebase worse. The opportunity is to split only where a named local module creates depth and preserves locality.

## Solution

Refactor large screen modules behind local screen submodules where the deletion test proves depth. Candidate modules include history sections, period tables, hierarchy branches, member sections, position sections, and repeated empty states. Keep each split local to the feature unless the same interface is used across multiple features.

Screen interfaces should remain small and externally stable. Tests should continue to exercise user-visible screen behavior rather than internal fragments.

## User Stories

1. As a future developer, I want screen files to be smaller and glancable, so that I can understand page layout quickly.
2. As a future developer, I want repeated screen sections to have names, so that domain presentation concepts are easy to find.
3. As a future developer, I want local screen modules to hide implementation detail, so that parent screens read as workflow composition.
4. As a future developer, I want to avoid mechanical fragments, so that callers do not need to learn shallow module names.
5. As an admin, I want management screens to keep the same visible behavior, so that refactoring does not disrupt workflows.
6. As a Member, I want organization read-only screens to keep the same visible behavior, so that refactoring does not affect browsing.
7. As a maintainer, I want tests to cover rendered behavior at the screen seam, so that internal movement remains flexible.
8. As a maintainer, I want shared UI extraction only when interfaces are stable, so that shared modules do not become dumping grounds.
9. As a future developer, I want feature-specific presentation to stay inside the feature module, so that domain language keeps locality.
10. As a future developer, I want future screens to follow a clear splitting rule, so that file size stays manageable as the app grows.

## Implementation Decisions

- Apply the deletion test before extracting any screen submodule.
- Prefer local submodules inside the feature when behavior is feature-specific.
- Promote presentation modules to shared space only when the interface is stable and genuinely used by multiple features.
- Keep screen module interfaces small.
- Preserve visible behavior, route URLs, and navigation.
- Avoid changing services, actions, or domain modules as part of screen splitting.
- Avoid splitting one-off JSX blocks that do not improve locality.

## Testing Decisions

- Preserve existing screen tests through the main screen interface.
- Add focused tests for extracted modules only when they have meaningful behavior not already covered at the screen seam.
- Avoid snapshot tests of incidental structure.
- Run lint, type checks, and existing tests after movement.

## Out of Scope

- Changing visual design.
- Changing feature behavior.
- Changing route composition.
- Changing dated-period business rules.
- Moving domain logic into UI modules.
- Creating a broad shared screen framework.

## Further Notes

- This spec complements the dated-period presentation spec. If dated-period presentation is implemented first, some screen glancability problems may disappear without additional extraction.


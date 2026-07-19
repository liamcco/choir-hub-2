# Admin Shell Folder Structure

Status: ready-for-agent

## Problem Statement

The codebase is mostly set up for growth with feature-oriented modules, but the admin folder currently mixes cross-cutting admin shell/access modules with individual admin workflow modules. Access policy, actor helpers, route composition, and future admin chrome concerns sit beside Member, Group, Group Membership, Position, and Position Assignment management.

This is workable today, but as admin surfaces multiply, the folder structure may stop communicating which modules are product workflows and which modules are shared admin shell/access infrastructure.

## Solution

Clarify the admin folder structure by separating admin shell/access modules from admin feature workflow modules. Keep feature modules close to their actions, runtime, screen, forms, service, and tests. Move or group cross-cutting admin modules only when doing so improves locality and makes future route/module placement clearer.

This should be a structural cleanup, not a product behavior change.

## User Stories

1. As a future developer, I want admin feature modules to be easy to identify, so that I can add new admin workflows consistently.
2. As a future developer, I want admin shell/access modules to be easy to identify, so that route, actor, and navigation changes have one obvious home.
3. As a future developer, I want feature module internals to stay together, so that Member, Group, Group Membership, Position, and Position Assignment workflows keep locality.
4. As a future developer, I want shared admin modules not to be confused with workflow modules, so that the folder tree remains navigable.
5. As a maintainer, I want imports to communicate ownership clearly, so that reviews can spot cross-feature leakage.
6. As a maintainer, I want no behavior change from folder movement, so that structural cleanup remains low risk.
7. As a maintainer, I want tests to continue passing after movement, so that path changes do not break module interfaces.
8. As a future developer, I want the structure to support fast growth, so that adding new admin features does not require rediscovering conventions.

## Implementation Decisions

- Keep feature-oriented modules as the primary structure.
- Separate admin shell/access modules from admin feature workflow modules if the separation improves locality.
- Keep each admin workflow module's actions, runtime, screen, forms, service, and tests together.
- Keep shared modules out of feature folders unless they are truly feature-specific.
- Do not promote code to shared space only because two files currently look similar.
- Preserve current route URLs and product behavior.
- Avoid churn in generated files and unrelated modules.

## Testing Decisions

- Run the existing test suite after movement.
- Use type checking and linting to catch broken imports.
- Do not add behavior tests solely for import path movement.
- Add tests only if the structure change introduces a new module interface.

## Out of Scope

- Refactoring feature workflow behavior.
- Changing admin route composition beyond moving an already-designed route runner module.
- Changing domain modules.
- Changing Prisma schema.
- Changing UI.
- Renaming domain concepts.

## Further Notes

- This spec may be best implemented opportunistically after admin route composition, because that work introduces a concrete admin shell/access module.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### UI tests
- Keep permanent frontend tests high-level, high-value, and focused on user-visible functionality. More granular or implementation-specific tests are acceptable temporarily during development, but remove them once that work is complete unless they protect a durable regression that cannot be covered effectively at a higher level.


### Issue tracker

Issues and specs are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-role label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: use root `CONTEXT.md` and `docs/adr/` for domain knowledge and decisions. See `docs/agents/domain.md`.

### Codebase structure

Follow the structural preferences in `docs/codebase-structure.md` when adding modules, Drizzle schema files, React screens, shared UI, and health checks.

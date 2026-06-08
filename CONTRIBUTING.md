# Contributing

## Setup

```bash
bun install
bun run dev
```

The app is available at `http://localhost:3000` by default.

## Before opening a PR

Run the checks that exist in this repository:

```bash
bun run lint
bun run build
```

## API client and schema generation

If you change API routes or schemas, regenerate artifacts:

```bash
bun run openapi:spec
bun run openapi-ts
bun run prisma:generate
```

## Notes

- Keep `src/prisma/schema/auth.prisma` managed by Better Auth tooling.
- Keep generated Prisma client output in `src/prisma/generated` (ignored by git).

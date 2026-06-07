# API Client

The project generates a typed API client (Hey API) from the local OpenAPI spec.

## Generation flow

```bash
bun run openapi:spec
bun run openapi-ts
```

- Spec generator: `scripts/generate-openapi.ts`
- OpenAPI TS config: `openapi-ts.config.ts`
- Output directory: `src/lib/api-client`

## Runtime config

`src/lib/hey-api.ts` configures generated client requests to:

- include credentials (`credentials: "include"`)
- disable fetch caching (`cache: "no-store"`)

## Usage patterns

- TanStack Query options from generated files (example: `getGroupsOptions` in `src/app/admin/groups/AdminGroupsPanel.tsx`).
- Generated mutations for write operations (example: `createGroupMutation` in `src/app/admin/groups/create/CreateGroupCard.tsx`).

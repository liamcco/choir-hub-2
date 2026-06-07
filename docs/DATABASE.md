# Database

## Stack

- Prisma ORM
- PostgreSQL datasource
- Prisma Postgres adapter (`@prisma/adapter-pg`)

## Key files

- Prisma client setup: `src/db/prisma.ts`
- Prisma schema: `src/prisma/schema/schema.prisma`
- Auth schema (managed separately): `src/prisma/schema/auth.prisma`

## Useful commands

```bash
bun run prisma:generate
```

Use Prisma Studio to inspect data locally if needed.

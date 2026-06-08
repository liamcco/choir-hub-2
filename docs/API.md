# API

API routes are implemented with Hono under `/api`.

## Entry points

- Hono app: `src/api/index.ts`
- Vercel route binding: `src/app/api/[[...route]]/route.ts`
- Route registration: `src/api/routes/index.ts`

## Main routes

- `GET /api/` public welcome route
- `GET /api/health` health check route
- Protected resource routes:
  - `GET /api/resources`
  - `GET /api/resources/:id`
  - `POST /api/resources`

## OpenAPI docs

Protected docs endpoints:

- `GET /api/openapi`
- `GET /api/scalar`
- `GET /api/swagger`

## Route conventions in this repo

- Use Zod schemas from `src/api/models/*`.
- Use `validator(...)` for params/body validation.
- Keep response metadata defined with `describeRoute` / `describeResponse`.

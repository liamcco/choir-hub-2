# API

API routes are implemented with Hono under `/api`.

## Entry points

- Hono app: `src/api/index.ts`
- Vercel route binding: `src/app/api/[[...route]]/route.ts`
- Route registration: `src/api/routes/index.ts`

## OpenAPI docs

Protected docs endpoints:

- `GET /api/openapi`
- `GET /api/scalar`
- `GET /api/swagger`

## Route conventions in this repo

- Use Zod schemas from `src/api/models/*`.
- Use `validator(...)` for params/body validation.
- Use `describeRoute` for route metadata such as `operationId` and `description`.
- For `GET` routes, put response schemas in `describeResponse`, not in `describeRoute`. This gives TypeScript a return contract for the handler.
- For non-GET routes, put response schemas in `describeRoute({ responses: ... })`.
- Use `returnsResponseErrors(...)` for typed `GET` error responses inside `describeResponse`.
- Use `returnsErrors(...)` for non-GET error responses inside `describeRoute`.

### GET route documentation

Every `GET` route should follow this shape:

```ts
router.get(
  '/:id',
  describeRoute({
    operationId: 'getThingById',
    description: 'Get a thing by ID',
  }),
  validator('param', idParamsSchema),
  describeResponse(
    async (c) => {
      const thing = await getThingById(c.req.param('id'))

      if (!thing) {
        return c.json({ message: 'Thing not found' }, 404)
      }

      return c.json(thing, 200)
    },
    {
      200: {
        description: 'Thing',
        content: {
          'application/json': {
            vSchema: thingSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Thing not found']]),
    },
  ),
)
```

The important detail is `vSchema` inside `describeResponse`. Hono OpenAPI uses that schema to infer which response bodies and status codes the handler may return.

For non-GET routes, use the OpenAPI `schema: resolver(...)` form:

```ts
router.post(
  '/',
  describeRoute({
    operationId: 'createThing',
    description: 'Create a thing',
    responses: {
      201: {
        description: 'Created thing',
        content: {
          'application/json': {
            schema: resolver(thingSchema),
          },
        },
      },
      ...returnsErrors([[400, 'Invalid request body']]),
    },
  }),
  validator('json', createThingSchema),
  async (c) => c.json(await createThing(c.req.valid('json')), 201),
)
```

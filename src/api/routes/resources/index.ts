import { Hono } from 'hono';
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi';

import { createResourceSchema, resourceSchema, resourcesResponseSchema } from '@/api/models/resources';
import { errorResponseSchema, idParamsSchema } from '@/api/models/utils';
import { createResource, getResourceById, getResources } from '@/services/resourceService';

const router = new Hono();

router.get(
  '/',

  describeRoute({
    operationId: 'getResources',
    description: 'Get protected resources for the authenticated user',
  }),

  describeResponse(
    async (c) => {
      const resources = await getResources();

      return c.json({ resources }, 200);
    },
    {
      200: {
        description: 'Protected resources for the authenticated user',
        content: {
          'application/json': {
            vSchema: resourcesResponseSchema,
          },
        },
      },
    },
  ),
);

router.get(
  '/:id',

  describeRoute({
    operationId: 'getResourceById',
    description: 'Get a specific protected resource by ID for the authenticated user',
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      const id = c.req.param('id');
      const resource = await getResourceById(id);

      if (!resource) {
        return c.json({ error: 'Resource not found' }, 404);
      }

      return c.json(resource, 200);
    },
    {
      200: {
        description: 'The requested protected resource',
        content: {
          'application/json': {
            vSchema: resourceSchema,
          },
        },
      },
      404: {
        description: 'Resource not found',
        content: {
          'application/json': {
            vSchema: errorResponseSchema,
          },
        },
      },
    },
  ),
);

router.post(
  '/',

  describeRoute({
    operationId: 'createResource',
    description: 'Create a new resource',
    responses: {
      201: {
        description: 'Resource created successfully',
        content: {
          'application/json': {
            schema: resolver(resourceSchema),
          },
        },
      },
      400: {
        description: 'Invalid request body',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),

  validator('json', createResourceSchema),

  async (c) => {
    const body = c.req.valid('json');

    const createdResource = await createResource(body.name, body.description);

    return c.json(createdResource, 201);
  },
);

export default router;

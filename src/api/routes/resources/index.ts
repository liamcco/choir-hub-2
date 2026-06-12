import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { createResourceItemSchema, resourceSchema, resourcesResponseSchema } from '@/api/models/resources'
import { idParamsSchema } from '@/api/models/utils'
import { createResource, getResourceById, getResources } from '@/api/services/resourceService'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getResources',
    description: 'Get protected resources for the authenticated user',
  }),

  describeResponse(
    async (c) => {
      const resources = await getResources()

      return c.json({ resources }, 200)
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
)

router.get(
  '/:id',

  describeRoute({
    operationId: 'getResourceById',
    description: 'Get a specific protected resource by ID for the authenticated user',
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      const id = c.req.param('id')
      const resource = await getResourceById(id)

      if (!resource) {
        return c.json({ message: 'Resource not found' }, 404)
      }

      return c.json(resource, 200)
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
      ...returnsResponseErrors([[404, 'Resource not found']]),
    },
  ),
)

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
      ...returnsErrors([[400, 'Invalid request body']]),
    },
  }),

  validator('json', createResourceItemSchema),

  async (c) => {
    const body = c.req.valid('json')

    const createdResource = await createResource(body.name, body.description)

    return c.json(createdResource, 201)
  },
)

export default router

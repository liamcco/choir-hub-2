import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'

import { createResourceFormSchema, resourceSchema, resourcesResponseSchema } from '@/api/models/resource'
import { resourceService } from '@/api/services/resourceService'
import z from 'zod'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getResources',
    description: 'Get protected resources for the authenticated user',
    tags: ['Testing'],
  }),

  describeResponse(
    async (c) => {
      const resources = await resourceService.getResources()

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
    tags: ['Testing'],
  }),

  validator('param', z.object({ id: z.string() })),

  describeResponse(
    async (c) => {
      const id = c.req.param('id')
      const resource = await resourceService.getResourceById(id)

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
    tags: ['Testing'],
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

  validator('json', createResourceFormSchema),

  async (c) => {
    const body = c.req.valid('json')

    const createdResource = await resourceService.createResource(body.name, body.description)

    return c.json(createdResource, 201)
  },
)

export default router

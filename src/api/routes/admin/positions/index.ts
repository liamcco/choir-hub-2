import { Context, Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'

import { assignPositionHolderSchema, positionSchema, updatePositionSchema } from '@/api/models/groups'
import { errorResponseSchema, idParamsSchema } from '@/api/models/utils'
import {
  assignPositionHolder,
  deletePosition,
  getPositionById,
  GroupServiceError,
  updatePosition,
  vacatePosition,
} from '@/api/services/groupService'

const router = new Hono()

router.get(
  '/:id',
  describeRoute({
    operationId: 'getPositionById',
    description: 'Get a position by ID',
    responses: {
      200: {
        description: 'Position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      404: {
        description: 'Position not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  async (c) => {
    const position = await getPositionById(c.req.param('id'))

    if (!position) {
      return c.json({ message: 'Position not found' }, 404)
    }

    return c.json(position, 200)
  },
)

router.patch(
  '/:id',
  describeRoute({
    operationId: 'updatePosition',
    description:
      'Update position details or current holder; holder membership must be a direct membership in the position group',
    responses: {
      200: {
        description: 'Updated position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      404: {
        description: 'Position or membership not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Position update conflict',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', updatePositionSchema),
  async (c) => {
    try {
      const position = await updatePosition(c.req.param('id'), c.req.valid('json'))

      return c.json(position, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:id',
  describeRoute({
    operationId: 'deletePosition',
    description: 'Delete a position definition from its group',
    responses: {
      204: {
        description: 'Position deleted',
      },
      404: {
        description: 'Position not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  async (c) => {
    try {
      await deletePosition(c.req.param('id'))

      return c.body(null, 204)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.post(
  '/:id/holder',
  describeRoute({
    operationId: 'assignPositionHolder',
    description: 'Assign a current holder to a position through an existing direct membership in the position group',
    responses: {
      200: {
        description: 'Position with assigned holder',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      404: {
        description: 'Position or membership not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Membership belongs to a different group',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', assignPositionHolderSchema),
  async (c) => {
    try {
      const position = await assignPositionHolder(c.req.param('id'), c.req.valid('json'))

      return c.json(position, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:id/holder',
  describeRoute({
    operationId: 'vacatePosition',
    description: 'Vacate a position by clearing its current holder and heldSince timestamp',
    responses: {
      200: {
        description: 'Vacated position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      404: {
        description: 'Position not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  async (c) => {
    try {
      const position = await vacatePosition(c.req.param('id'))

      return c.json(position, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

function handleGroupServiceError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

export default router

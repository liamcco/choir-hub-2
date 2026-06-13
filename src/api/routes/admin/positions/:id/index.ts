import { Context, Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { positionSchema, updatePositionRequestSchema } from '@/api/models/group'
import { idParamsSchema } from '@/api/models/utils'
import { GroupServiceError } from '@/api/services/groups/errors'
import { deletePosition, getPositionById, updatePosition } from '@/api/services/positions/positionService'
import positionHolderRouter from './holder'

const router = new Hono()

router.get(
  '/:id',

  describeRoute({
    operationId: 'getPositionById',
    description: 'Get a position by ID',
    tags: ['Positions'],
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      const position = await getPositionById(c.req.param('id'))

      if (!position) {
        return c.json({ message: 'Position not found' }, 404)
      }

      return c.json(position, 200)
    },
    {
      200: {
        description: 'Position',
        content: {
          'application/json': {
            vSchema: positionSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Position not found']]),
    },
  ),
)

router.patch(
  '/:id',

  describeRoute({
    operationId: 'updatePosition',
    description: 'Update global position details, associated groups, or current holder person',
    tags: ['Positions'],
    responses: {
      200: {
        description: 'Updated position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      ...returnsErrors([
        [404, 'Position, group, or holder person not found'],
        [409, 'Position update conflict'],
      ]),
    },
  }),

  validator('param', idParamsSchema),

  validator('json', updatePositionRequestSchema),

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
    description: 'Delete a global position definition',
    tags: ['Positions'],
    responses: {
      204: {
        description: 'Position deleted',
      },
      ...returnsErrors([[404, 'Position not found']]),
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

function handleGroupServiceError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

router.route('/', positionHolderRouter)
export default router

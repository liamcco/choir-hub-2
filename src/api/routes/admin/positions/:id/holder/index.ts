import { returnsErrors } from '@/api/docs/errors'
import { assignPositionHolderRequestSchema, positionSchema } from '@/api/models/group'
import { idParamsSchema } from '@/api/models/utils'
import { handleGroupServiceError } from '@/api/services/groups'
import { assignPositionHolder, vacatePosition } from '@/api/services/positions'
import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'

const router = new Hono()

router.post(
  '/:id/holder',

  describeRoute({
    operationId: 'assignPositionHolder',
    description: 'Assign a current holder person to a position',
    tags: ['Positions'],
    responses: {
      200: {
        description: 'Position with assigned holder',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      ...returnsErrors([[404, 'Position or holder person not found']]),
    },
  }),

  validator('param', idParamsSchema),

  validator('json', assignPositionHolderRequestSchema),

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
    tags: ['Positions'],
    responses: {
      200: {
        description: 'Vacated position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      ...returnsErrors([[404, 'Position not found']]),
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

export default router

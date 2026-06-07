import { returnsErrors } from '@/api/docs/errors'
import { assignPositionHolderRequestSchema, positionSchema } from '@/api/models/position'
import { assignPositionHolder, vacatePosition } from '@/api/services/positions'
import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.post(
  '/:positionId/holder',

  describeRoute({
    operationId: 'assignPositionHolder',
    description: 'Assign a current holder user to a position',
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
      ...returnsErrors([[404, 'Position or holder user not found']]),
    },
  }),

  validator('param', z.object({ positionId: z.string() })),

  validator('json', assignPositionHolderRequestSchema),

  async (c) => {
    const position = await assignPositionHolder(c.req.param('positionId'), c.req.valid('json'))

    return c.json(position, 200)
  },
)

router.delete(
  '/:positionId/holder',

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

  validator('param', z.object({ positionId: z.string() })),

  async (c) => {
    const position = await vacatePosition(c.req.param('positionId'))

    return c.json(position, 200)
  },
)

export default router

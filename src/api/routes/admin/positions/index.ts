import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors } from '@/api/docs/errors'
import { createPositionRequestSchema, positionSchema } from '@/api/models/position'
import { createPosition, getPositions } from '@/api/services/positions/positionService'
import z from 'zod'
import positionByIdRouter from './:id'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getPositions',
    description: 'List all global positions',
    tags: ['Positions'],
  }),

  describeResponse(
    async (c) => {
      const positions = await getPositions()

      return c.json(positions, 200)
    },
    {
      200: {
        description: 'Global positions',
        content: {
          'application/json': {
            vSchema: z.array(positionSchema),
          },
        },
      },
    },
  ),
)

router.post(
  '/',

  describeRoute({
    operationId: 'createPosition',
    description: 'Create a new global position',
    tags: ['Positions'],
    responses: {
      201: {
        description: 'Created position',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      ...returnsErrors([
        [400, 'Invalid request body'],
        [404, 'Associated group or holder user not found'],
        [409, 'Position naming conflict'],
      ]),
    },
  }),

  validator('json', createPositionRequestSchema),

  async (c) => {
    const input = c.req.valid('json')
    const position = await createPosition(input)

    return c.json(position, 201)
  },
)

router.route('/', positionByIdRouter)
export default router

import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver } from 'hono-openapi'

import { returnsErrors } from '@/api/docs/errors'
import { positionSchema } from '@/api/models/group'
import { getPositions } from '@/api/services/positions/positionService'
import z from 'zod'
import positionByIdRouter from './:id'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getPositions',
    description: 'List all global positions, optionally filtered by associated group ID',
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
      ...returnsErrors([[409, 'Position naming conflict']]),
    },
  }),

  async (c) => {
    // Implementation for creating a new position would go here
    return c.json({ message: 'Not implemented' }, 501)
  },
)

router.route('/', positionByIdRouter)
export default router

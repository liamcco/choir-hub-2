import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { createPositionRequestSchema, positionSchema } from '@/api/models/group'
import { positionsResponseSchema } from '@/api/models/position'
import { idParamsSchema } from '@/api/models/utils'
import { handleGroupServiceError, handleGroupServiceGetError } from '@/api/services/groups/errors'
import { createGroupPosition, getGroupPositions } from '@/api/services/positions'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.get(
  '/:id/positions',

  describeRoute({
    operationId: 'getGroupPositions',
    description: 'List positions defined for a group, including vacant positions',
    tags: ['Groups', 'Positions'],
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      try {
        const positions = await getGroupPositions(c.req.param('id'))

        return c.json(positions, 200)
      } catch (error) {
        return handleGroupServiceGetError(c, error)
      }
    },
    {
      200: {
        description: 'Group positions',
        content: {
          'application/json': {
            vSchema: z.array(positionSchema),
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
)

router.post(
  '/:id/positions',

  describeRoute({
    operationId: 'createGroupPosition',
    description: 'Create a global position and associate it with this group plus any extra groups in the request body',
    tags: ['Groups', 'Positions'],
    responses: {
      201: {
        description: 'Created position',
        content: {
          'application/json': {
            schema: resolver(positionsResponseSchema.shape.positions.element),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group or holder person not found'],
        [409, 'Position name or holder conflict'],
      ]),
    },
  }),

  validator('param', idParamsSchema),

  validator('json', createPositionRequestSchema),

  async (c) => {
    try {
      const position = await createGroupPosition(c.req.param('id'), c.req.valid('json'))

      return c.json(position, 201)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

export default router

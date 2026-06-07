import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { positionSchema } from '@/api/models/position'
import { addPositionToGroup, deletePositionFromGroup, getPositionsInGroup } from '@/api/services/positions'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.get(
  '/:groupId/positions',

  describeRoute({
    operationId: 'getGroupPositions',
    description: 'List positions defined for a group, including vacant positions',
    tags: ['Groups', 'Positions'],
  }),

  validator('param', z.object({ groupId: z.string() })),

  describeResponse(
    async (c) => {
      const groupId = c.req.param('groupId')
      const positions = await getPositionsInGroup(groupId)

      return c.json(positions, 200)
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
  '/:groupId/positions',

  describeRoute({
    operationId: 'addPositionToGroup',
    description: 'Associate a position with this group',
    tags: ['Groups', 'Positions'],
    responses: {
      200: {
        description: 'Position associated with this group',
        content: {
          'application/json': {
            schema: resolver(positionSchema),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group or position not found'],
        [409, 'Position association conflict'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string() })),

  validator('query', z.object({ positionId: z.string() })),

  async (c) => {
    const position = await addPositionToGroup(c.req.valid('param').groupId, c.req.valid('query').positionId)

    return c.json(position, 200)
  },
)

router.delete(
  '/:groupId/positions/:positionId',

  describeRoute({
    operationId: 'removePositionFromGroup',
    description: 'Remove a group association from a position while preserving the global position definition',
    tags: ['Groups', 'Positions'],
    responses: {
      204: {
        description: 'Position removed from this group',
      },
      ...returnsErrors([
        [404, 'Group, position, or association not found'],
        [409, 'Position must keep at least one group association'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string(), positionId: z.string() })),

  async (c) => {
    await deletePositionFromGroup(c.req.valid('param').groupId, c.req.valid('param').positionId)

    return c.body(null, 204)
  },
)

export default router

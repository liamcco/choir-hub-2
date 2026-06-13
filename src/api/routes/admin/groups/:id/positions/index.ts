import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { positionSchema } from '@/api/models/position'
import { handleServiceError, handleServiceQueryError } from '@/api/services/errors'
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
      try {
        const groupId = c.req.param('groupId')
        const positions = await getPositionsInGroup(groupId)

        return c.json(positions, 200)
      } catch (error) {
        return handleServiceQueryError(c, error)
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
  '/:groupId/positions',

  describeRoute({
    operationId: 'addPositionToGroup',
    description: 'Associate a position with this group',
    tags: ['Groups', 'Positions'],
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
        [404, 'Group or holder user not found'],
        [409, 'Position name or holder conflict'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string() })),

  validator('query', z.object({ positionId: z.string() })),

  async (c) => {
    try {
      const position = await addPositionToGroup(c.req.valid('param').groupId, c.req.valid('query').positionId)

      return c.json(position, 201)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

router.delete(
  '/:groupId/positions/:positionId',

  describeRoute({
    operationId: 'deleteGroupPosition',
    description:
      'Delete a position defined for this group; the position must not be currently held by anyone, but any group associations will be removed regardless of holder status',
    tags: ['Groups', 'Positions'],
    responses: {
      204: {
        description: 'Deleted position',
      },
      ...returnsErrors([
        [404, 'Group or position not found'],
        [409, 'Position currently held and cannot be deleted'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string(), positionId: z.string() })),

  async (c) => {
    try {
      await deletePositionFromGroup(c.req.valid('param').groupId, c.req.valid('param').positionId)

      return c.status(204)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

export default router

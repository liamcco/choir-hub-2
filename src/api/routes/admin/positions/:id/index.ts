import { Context, Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { positionSchema, updatePositionRequestSchema } from '@/api/models/position'
import { ApiError } from '@/api/services/errors'
import { deletePosition, getPositionById, updatePosition } from '@/api/services/positions/positionService'
import z from 'zod'
import positionHolderRouter from './holder'

const router = new Hono()

router.get(
  '/:positionId',

  describeRoute({
    operationId: 'getPositionById',
    description: 'Get a position by ID',
    tags: ['Positions'],
  }),

  validator('param', z.object({ positionId: z.string() })),

  describeResponse(
    async (c) => {
      const position = await getPositionById(c.req.param('positionId'))

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
  '/:positionId',

  describeRoute({
    operationId: 'updatePosition',
    description: 'Update global position details, associated groups, or current holder user',
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
        [404, 'Position, group, or holder user not found'],
        [409, 'Position update conflict'],
      ]),
    },
  }),

  validator('param', z.object({ positionId: z.string() })),

  validator('json', updatePositionRequestSchema),

  async (c) => {
    try {
      const position = await updatePosition(c.req.param('positionId'), c.req.valid('json'))

      return c.json(position, 200)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

router.delete(
  '/:positionId',

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

  validator('param', z.object({ positionId: z.string() })),

  async (c) => {
    try {
      await deletePosition(c.req.param('positionId'))

      return c.body(null, 204)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

function handleServiceError(c: Context, error: unknown) {
  if (error instanceof ApiError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

router.route('/', positionHolderRouter)
export default router

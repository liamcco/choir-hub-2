import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { groupKindSchema, updateGroupKindRequestSchema } from '@/api/models/group'
import { handleServiceError } from '@/api/services/errors'
import { deleteGroupKind, getGroupKindById, updateGroupKind } from '@/api/services/groups'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.get(
  '/:kindId',

  describeRoute({
    operationId: 'getGroupKindById',
    description: 'Get a group kind by ID',
    tags: ['Group Kinds'],
  }),

  validator('param', z.object({ kindId: z.string() })),

  describeResponse(
    async (c) => {
      const groupKind = await getGroupKindById(c.req.param('kindId'))

      if (!groupKind) {
        return c.json({ message: 'Group kind not found' }, 404)
      }

      return c.json(groupKind, 200)
    },
    {
      200: {
        description: 'Group kind',
        content: {
          'application/json': {
            vSchema: groupKindSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group kind not found']]),
    },
  ),
)

router.patch(
  '/:kindId',

  describeRoute({
    operationId: 'updateGroupKind',
    description: 'Update a group kind',
    tags: ['Group Kinds'],
    responses: {
      200: {
        description: 'Updated group kind',
        content: {
          'application/json': {
            schema: resolver(groupKindSchema),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group kind not found'],
        [409, 'Group kind name already exists'],
      ]),
    },
  }),

  validator('param', z.object({ kindId: z.string() })),

  validator('json', updateGroupKindRequestSchema),

  async (c) => {
    try {
      const groupKind = await updateGroupKind(c.req.param('kindId'), c.req.valid('json'))

      return c.json(groupKind, 200)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

router.delete(
  '/:kindId',

  describeRoute({
    operationId: 'deleteGroupKind',
    description: 'Delete an unused group kind',
    tags: ['Group Kinds'],
    responses: {
      204: {
        description: 'Group kind deleted',
      },
      ...returnsErrors([
        [404, 'Group kind not found'],
        [409, 'Group kind is used by groups'],
      ]),
    },
  }),

  validator('param', z.object({ kindId: z.string() })),

  async (c) => {
    try {
      await deleteGroupKind(c.req.param('kindId'))

      return c.body(null, 204)
    } catch (error) {
      return handleServiceError(c, error)
    }
  },
)

export default router

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { groupKindSchema, updateGroupKindRequestSchema } from '@/api/models/group'
import { idParamsSchema } from '@/api/models/utils'
import { deleteGroupKind, getGroupKindById, updateGroupKind } from '@/api/services/groups'
import { handleGroupServiceError } from '@/api/services/groups/errors'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

const router = new Hono()

router.get(
  '/:id',

  describeRoute({
    operationId: 'getGroupKindById',
    description: 'Get a group kind by ID',
    tags: ['Group Kinds'],
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      const groupKind = await getGroupKindById(c.req.param('id'))

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
  '/:id',

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

  validator('param', idParamsSchema),

  validator('json', updateGroupKindRequestSchema),

  async (c) => {
    try {
      const groupKind = await updateGroupKind(c.req.param('id'), c.req.valid('json'))

      return c.json(groupKind, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:id',

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

  validator('param', idParamsSchema),

  async (c) => {
    try {
      await deleteGroupKind(c.req.param('id'))

      return c.body(null, 204)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

export default router

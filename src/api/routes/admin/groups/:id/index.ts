import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { groupSchema, updateGroupRequestSchema } from '@/api/models/group'
import { deleteGroup, getGroupById, updateGroup } from '@/api/services/groups'
import { handleGroupServiceError } from '@/api/services/groups/errors'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'
import groupMembershipsRouter from './members'
import groupPositionsRouter from './positions'

const router = new Hono()

router.get(
  '/:groupId',

  describeRoute({
    operationId: 'getGroupById',
    description: 'Get a group by ID',
    tags: ['Groups'],
  }),

  validator('param', z.object({ groupId: z.string() })),

  describeResponse(
    async (c) => {
      const group = await getGroupById(c.req.param('groupId'))

      if (!group) {
        return c.json({ message: 'Group not found' }, 404)
      }

      return c.json(group, 200)
    },
    {
      200: {
        description: 'Group',
        content: {
          'application/json': {
            vSchema: groupSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
)

router.patch(
  '/:groupId',

  describeRoute({
    operationId: 'updateGroup',
    description: 'Update group details or move a group within the hierarchy; cyclic hierarchies are rejected',
    tags: ['Groups'],
    responses: {
      200: {
        description: 'Updated group',
        content: {
          'application/json': {
            schema: resolver(groupSchema),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group, group kind, or parent group not found'],
        [409, 'Group update conflict'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string() })),

  validator('json', updateGroupRequestSchema),

  async (c) => {
    try {
      const group = await updateGroup(c.req.param('groupId'), c.req.valid('json'))

      return c.json(group, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:groupId',

  describeRoute({
    operationId: 'deleteGroup',
    description: 'Delete a leaf group; groups with child groups must be moved or deleted after their children',
    tags: ['Groups'],
    responses: {
      204: {
        description: 'Group deleted',
      },
      ...returnsErrors([
        [404, 'Group not found'],
        [409, 'Group has child groups'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string() })),

  async (c) => {
    try {
      await deleteGroup(c.req.param('groupId'))

      return c.body(null, 204)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.route('/', groupPositionsRouter)
router.route('/', groupMembershipsRouter)
export default router

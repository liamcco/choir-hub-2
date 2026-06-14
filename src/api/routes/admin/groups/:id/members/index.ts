import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
import { addUserToGroupRequestSchema, groupMemberSchema, membersQuerySchema } from '@/api/models/group'
import { createGroupMembership, deleteGroupMembership, getGroupMembers } from '@/api/services/groups'
import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.get(
  '/:groupId/members',

  describeRoute({
    operationId: 'getGroupMembers',
    description:
      'List group members. Use onlyDirectMembers=true to include only direct members, or onlyDirectMembers=false to include effective members from descendant groups.',
    tags: ['Groups'],
  }),

  validator('param', z.object({ groupId: z.string() })),
  validator('query', membersQuerySchema),

  describeResponse(
    async (c) => {
      const { onlyDirectMembers = false } = membersQuerySchema.parse(c.req.query())
      const groupId = c.req.param('groupId')

      const members = await getGroupMembers(groupId, onlyDirectMembers)

      return c.json(members, 200)
    },
    {
      200: {
        description: 'Group memberships',
        content: {
          'application/json': {
            vSchema: z.array(groupMemberSchema),
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
)

router.post(
  '/:groupId/members',

  describeRoute({
    operationId: 'addUserToGroup',
    description: 'Add a direct user membership to a non-container group',
    tags: ['Groups'],
    responses: {
      201: {
        description: 'Created direct membership',
        content: {
          'application/json': {
            schema: resolver(groupMemberSchema),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group or user not found'],
        [409, 'Container group or duplicate membership conflict'],
      ]),
    },
  }),

  validator('param', z.object({ groupId: z.string() })),

  validator('json', addUserToGroupRequestSchema),

  async (c) => {
    const membership = await createGroupMembership(c.req.param('groupId'), c.req.valid('json').userId)

    return c.json(membership, 201)
  },
)

router.delete(
  '/:groupId/members/:userId',

  describeRoute({
    operationId: 'deleteGroupMembership',
    description: 'Remove a direct membership; position assignments are managed independently',
    tags: ['Groups'],
    responses: {
      204: {
        description: 'Membership deleted',
      },
      ...returnsErrors([[404, 'Member not found in this group']]),
    },
  }),

  validator('param', z.object({ groupId: z.string(), userId: z.string() })),

  async (c) => {
    await deleteGroupMembership(c.req.param('groupId'), c.req.param('userId'))

    return c.body(null, 204)
  },
)

export default router

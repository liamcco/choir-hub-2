import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors } from '@/api/docs/errors'
import { createGroupRequestSchema, groupSchema } from '@/api/models/group'
import { createGroup, getGroups } from '@/api/services/groups'
import { handleGroupServiceError } from '@/api/services/groups/errors'
import z from 'zod'
import groupsByIdRouter from './:id'
import groupKindsRoute from './kinds'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getGroups',
    description: 'List groups with their kind and hierarchy fields',
    tags: ['Groups'],
  }),

  describeResponse(
    async (c) => {
      const groups = await getGroups()

      return c.json(groups, 200)
    },
    {
      200: {
        description: 'Groups',
        content: {
          'application/json': {
            vSchema: z.array(groupSchema),
          },
        },
      },
    },
  ),
)

router.post(
  '/',

  describeRoute({
    operationId: 'createGroup',
    description: 'Create a group and optionally attach it to a parent group',
    tags: ['Groups'],
    responses: {
      201: {
        description: 'Created group',
        content: {
          'application/json': {
            schema: resolver(groupSchema),
          },
        },
      },
      ...returnsErrors([
        [400, 'Invalid request body'],
        [404, 'Referenced group kind or parent group not found'],
        [409, 'Group name conflict'],
      ]),
    },
  }),

  validator('json', createGroupRequestSchema),

  async (c) => {
    try {
      const group = await createGroup(c.req.valid('json'))

      return c.json(group, 201)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.route('/kinds', groupKindsRoute)
router.route('/', groupsByIdRouter)
export default router

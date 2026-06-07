import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors } from '@/api/docs/errors'
import { createGroupKindRequestSchema, groupKindSchema } from '@/api/models/group'
import { createGroupKind, getGroupKinds } from '@/api/services/groups'

import z from 'zod'
import groupKindByIdRouter from './:id'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getGroupKinds',
    description:
      'List group kind records that classify groups, such as choir, voice part, board, committee, or project',
    tags: ['Group Kinds'],
  }),

  describeResponse(
    async (c) => {
      const groupKinds = await getGroupKinds()

      return c.json(groupKinds, 200)
    },
    {
      200: {
        description: 'Group kinds',
        content: {
          'application/json': {
            vSchema: z.array(groupKindSchema),
          },
        },
      },
    },
  ),
)

router.post(
  '/',

  describeRoute({
    operationId: 'createGroupKind',
    description: 'Create a group kind',
    tags: ['Group Kinds'],
    responses: {
      201: {
        description: 'Created group kind',
        content: {
          'application/json': {
            schema: resolver(groupKindSchema),
          },
        },
      },
      ...returnsErrors([
        [400, 'Invalid request body'],
        [409, 'Group kind name already exists'],
      ]),
    },
  }),

  validator('json', createGroupKindRequestSchema),

  async (c) => {
    const groupKind = await createGroupKind(c.req.valid('json'))

    return c.json(groupKind, 201)
  },
)

router.route('/', groupKindByIdRouter)
export default router

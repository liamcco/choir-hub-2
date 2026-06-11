import { Context, Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'

import { createGroupKindSchema, groupKindSchema, groupKindsResponseSchema, updateGroupKindSchema } from '@/api/models/groups'
import { errorResponseSchema, idParamsSchema } from '@/api/models/utils'
import {
  createGroupKind,
  deleteGroupKind,
  getGroupKindById,
  getGroupKinds,
  GroupServiceError,
  updateGroupKind,
} from '@/api/services/groupService'

const router = new Hono()

router.get(
  '/',
  describeRoute({
    operationId: 'getGroupKinds',
    description: 'List group kind records that classify groups, such as choir, voice part, board, committee, or project',
    responses: {
      200: {
        description: 'Group kinds',
        content: {
          'application/json': {
            schema: resolver(groupKindsResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const groupKinds = await getGroupKinds()

    return c.json({ groupKinds }, 200)
  },
)

router.get(
  '/:id',
  describeRoute({
    operationId: 'getGroupKindById',
    description: 'Get a group kind by ID',
    responses: {
      200: {
        description: 'Group kind',
        content: {
          'application/json': {
            schema: resolver(groupKindSchema),
          },
        },
      },
      404: {
        description: 'Group kind not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  async (c) => {
    const groupKind = await getGroupKindById(c.req.param('id'))

    if (!groupKind) {
      return c.json({ message: 'Group kind not found' }, 404)
    }

    return c.json(groupKind, 200)
  },
)

router.post(
  '/',
  describeRoute({
    operationId: 'createGroupKind',
    description: 'Create a group kind',
    responses: {
      201: {
        description: 'Created group kind',
        content: {
          'application/json': {
            schema: resolver(groupKindSchema),
          },
        },
      },
      400: {
        description: 'Invalid request body',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group kind name already exists',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('json', createGroupKindSchema),
  async (c) => {
    try {
      const groupKind = await createGroupKind(c.req.valid('json'))

      return c.json(groupKind, 201)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.patch(
  '/:id',
  describeRoute({
    operationId: 'updateGroupKind',
    description: 'Update a group kind',
    responses: {
      200: {
        description: 'Updated group kind',
        content: {
          'application/json': {
            schema: resolver(groupKindSchema),
          },
        },
      },
      404: {
        description: 'Group kind not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group kind name already exists',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', updateGroupKindSchema),
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
    responses: {
      204: {
        description: 'Group kind deleted',
      },
      404: {
        description: 'Group kind not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group kind is used by groups',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
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

function handleGroupServiceError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

export default router

import { Context, Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'

import {
  createGroupSchema,
  createMembershipSchema,
  createPositionSchema,
  effectiveMembershipsResponseSchema,
  groupMembershipsResponseSchema,
  groupSchema,
  groupsResponseSchema,
  positionsResponseSchema,
  updateGroupSchema,
} from '@/api/models/groups'
import { errorResponseSchema, idParamsSchema } from '@/api/models/utils'
import {
  createGroup,
  createGroupMembership,
  createGroupPosition,
  deleteGroup,
  deleteGroupMembership,
  getDirectGroupMemberships,
  getEffectiveGroupMembers,
  getGroupById,
  getGroupPositions,
  getGroups,
  GroupServiceError,
  updateGroup,
} from '@/api/services/groupService'

const router = new Hono()

router.get(
  '/',
  describeRoute({
    operationId: 'getGroups',
    description: 'List groups with their kind and hierarchy fields',
    responses: {
      200: {
        description: 'Groups',
        content: {
          'application/json': {
            schema: resolver(groupsResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const groups = await getGroups()

    return c.json({ groups }, 200)
  },
)

router.post(
  '/',
  describeRoute({
    operationId: 'createGroup',
    description: 'Create a group and optionally attach it to a parent group',
    responses: {
      201: {
        description: 'Created group',
        content: {
          'application/json': {
            schema: resolver(groupSchema),
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
      404: {
        description: 'Referenced group kind or parent group not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group name conflict',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('json', createGroupSchema),
  async (c) => {
    try {
      const group = await createGroup(c.req.valid('json'))

      return c.json(group, 201)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.get(
  '/:id',
  describeRoute({
    operationId: 'getGroupById',
    description: 'Get a group by ID',
    responses: {
      200: {
        description: 'Group',
        content: {
          'application/json': {
            schema: resolver(groupSchema),
          },
        },
      },
      404: {
        description: 'Group not found',
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
    const group = await getGroupById(c.req.param('id'))

    if (!group) {
      return c.json({ message: 'Group not found' }, 404)
    }

    return c.json(group, 200)
  },
)

router.patch(
  '/:id',
  describeRoute({
    operationId: 'updateGroup',
    description: 'Update group details or move a group within the hierarchy; cyclic hierarchies are rejected',
    responses: {
      200: {
        description: 'Updated group',
        content: {
          'application/json': {
            schema: resolver(groupSchema),
          },
        },
      },
      404: {
        description: 'Group, group kind, or parent group not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group update conflict',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', updateGroupSchema),
  async (c) => {
    try {
      const group = await updateGroup(c.req.param('id'), c.req.valid('json'))

      return c.json(group, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:id',
  describeRoute({
    operationId: 'deleteGroup',
    description: 'Delete a leaf group; groups with child groups must be moved or deleted after their children',
    responses: {
      204: {
        description: 'Group deleted',
      },
      404: {
        description: 'Group not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Group has child groups',
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
      await deleteGroup(c.req.param('id'))

      return c.body(null, 204)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.get(
  '/:id/memberships',
  describeRoute({
    operationId: 'getDirectGroupMemberships',
    description: 'List direct person memberships for a group',
    responses: {
      200: {
        description: 'Direct group memberships',
        content: {
          'application/json': {
            schema: resolver(groupMembershipsResponseSchema),
          },
        },
      },
      404: {
        description: 'Group not found',
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
      const memberships = await getDirectGroupMemberships(c.req.param('id'))

      return c.json({ memberships }, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.post(
  '/:id/memberships',
  describeRoute({
    operationId: 'createGroupMembership',
    description: 'Add a direct person membership to a non-container group',
    responses: {
      201: {
        description: 'Created direct membership',
        content: {
          'application/json': {
            schema: resolver(groupMembershipsResponseSchema.shape.memberships.element),
          },
        },
      },
      404: {
        description: 'Group or person not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Container group or duplicate membership conflict',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', createMembershipSchema),
  async (c) => {
    try {
      const membership = await createGroupMembership(c.req.param('id'), c.req.valid('json'))

      return c.json(membership, 201)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.delete(
  '/:id/memberships/:membershipId',
  describeRoute({
    operationId: 'deleteGroupMembership',
    description: 'Remove a direct membership and vacate any positions currently held through that membership',
    responses: {
      204: {
        description: 'Membership deleted',
      },
      404: {
        description: 'Membership not found in this group',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema.extend({ membershipId: idParamsSchema.shape.id })),
  async (c) => {
    try {
      await deleteGroupMembership(c.req.param('id'), c.req.param('membershipId'))

      return c.body(null, 204)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.get(
  '/:id/effective-members',
  describeRoute({
    operationId: 'getEffectiveGroupMembers',
    description:
      'List effective group members by including direct memberships from the group and all descendant groups; parent memberships do not flow down',
    responses: {
      200: {
        description: 'Effective members',
        content: {
          'application/json': {
            schema: resolver(effectiveMembershipsResponseSchema),
          },
        },
      },
      404: {
        description: 'Group not found',
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
      const members = await getEffectiveGroupMembers(c.req.param('id'))

      return c.json({ members }, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.get(
  '/:id/positions',
  describeRoute({
    operationId: 'getGroupPositions',
    description: 'List positions defined for a group, including vacant positions',
    responses: {
      200: {
        description: 'Group positions',
        content: {
          'application/json': {
            schema: resolver(positionsResponseSchema),
          },
        },
      },
      404: {
        description: 'Group not found',
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
      const positions = await getGroupPositions(c.req.param('id'))

      return c.json({ positions }, 200)
    } catch (error) {
      return handleGroupServiceError(c, error)
    }
  },
)

router.post(
  '/:id/positions',
  describeRoute({
    operationId: 'createGroupPosition',
    description: 'Create a position for a group, optionally assigning one current holder through an existing direct membership',
    responses: {
      201: {
        description: 'Created position',
        content: {
          'application/json': {
            schema: resolver(positionsResponseSchema.shape.positions.element),
          },
        },
      },
      404: {
        description: 'Group or membership not found',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
      409: {
        description: 'Position name or holder conflict',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', idParamsSchema),
  validator('json', createPositionSchema),
  async (c) => {
    try {
      const position = await createGroupPosition(c.req.param('id'), c.req.valid('json'))

      return c.json(position, 201)
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

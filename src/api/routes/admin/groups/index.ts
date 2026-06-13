import { Context, Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { returnsErrors, returnsResponseErrors } from '@/api/docs/errors'
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
import { idParamsSchema } from '@/api/models/utils'
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
  }),

  describeResponse(
    async (c) => {
      const groups = await getGroups()

      return c.json({ groups }, 200)
    },
    {
      200: {
        description: 'Groups',
        content: {
          'application/json': {
            vSchema: groupsResponseSchema,
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
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      const group = await getGroupById(c.req.param('id'))

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
      ...returnsErrors([
        [404, 'Group, group kind, or parent group not found'],
        [409, 'Group update conflict'],
      ]),
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
      ...returnsErrors([
        [404, 'Group not found'],
        [409, 'Group has child groups'],
      ]),
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
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      try {
        const memberships = await getDirectGroupMemberships(c.req.param('id'))

        return c.json({ memberships }, 200)
      } catch (error) {
        return handleGroupGetError(c, error)
      }
    },
    {
      200: {
        description: 'Direct group memberships',
        content: {
          'application/json': {
            vSchema: groupMembershipsResponseSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
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
      ...returnsErrors([
        [404, 'Group or person not found'],
        [409, 'Container group or duplicate membership conflict'],
      ]),
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
    description: 'Remove a direct membership; position assignments are managed independently',
    responses: {
      204: {
        description: 'Membership deleted',
      },
      ...returnsErrors([[404, 'Membership not found in this group']]),
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
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      try {
        const members = await getEffectiveGroupMembers(c.req.param('id'))

        return c.json({ members }, 200)
      } catch (error) {
        return handleGroupGetError(c, error)
      }
    },
    {
      200: {
        description: 'Effective members',
        content: {
          'application/json': {
            vSchema: effectiveMembershipsResponseSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
)

router.get(
  '/:id/positions',

  describeRoute({
    operationId: 'getGroupPositions',
    description: 'List positions defined for a group, including vacant positions',
  }),

  validator('param', idParamsSchema),

  describeResponse(
    async (c) => {
      try {
        const positions = await getGroupPositions(c.req.param('id'))

        return c.json({ positions }, 200)
      } catch (error) {
        return handleGroupGetError(c, error)
      }
    },
    {
      200: {
        description: 'Group positions',
        content: {
          'application/json': {
            vSchema: positionsResponseSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Group not found']]),
    },
  ),
)

router.post(
  '/:id/positions',

  describeRoute({
    operationId: 'createGroupPosition',
    description: 'Create a global position and associate it with this group plus any extra groups in the request body',
    responses: {
      201: {
        description: 'Created position',
        content: {
          'application/json': {
            schema: resolver(positionsResponseSchema.shape.positions.element),
          },
        },
      },
      ...returnsErrors([
        [404, 'Group or holder person not found'],
        [409, 'Position name or holder conflict'],
      ]),
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

function handleGroupGetError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError && error.status === 404) {
    return c.json({ message: error.message }, 404)
  }

  throw error
}

export default router

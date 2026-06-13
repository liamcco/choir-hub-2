import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import { createUsersRequestSchema, createUsersResponseSchema, userSchema } from '@/api/models/user'
import { createUsers, getUsers } from '@/api/services/users/userService'
import z from 'zod'
import userByIdRouter from './:id'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getUsers',
    description: 'Get created users with their Better Auth user details',
    tags: ['Users'],
  }),

  describeResponse(
    async (c) => {
      const users = await getUsers()

      return c.json(users, 200)
    },
    {
      200: {
        description: 'Createed users with Better Auth user details',
        content: {
          'application/json': {
            vSchema: z.array(userSchema),
          },
        },
      },
    },
  ),
)

router.post(
  '/',

  describeRoute({
    operationId: 'createUsers',
    description: 'Create Better Auth users and matching application user profiles',
    tags: ['Users'],
    responses: {
      200: {
        description: 'Createing results',
        content: {
          'application/json': {
            schema: resolver(createUsersResponseSchema),
          },
        },
      },
    },
  }),

  validator('json', createUsersRequestSchema),

  async (c) => {
    const body = c.req.valid('json')
    const createdUsers = await createUsers(body)

    return c.json(createdUsers, 200)
  },
)

router.route('/', userByIdRouter)
export default router

import { returnsResponseErrors } from '@/api/docs/errors'
import { userSchema } from '@/api/models/user'
import { getUserById } from '@/api/services/users'
import { Hono } from 'hono'
import { describeResponse, describeRoute, validator } from 'hono-openapi'
import z from 'zod'

const router = new Hono()

router.get(
  '/:userId',

  describeRoute({
    operationId: 'getUserById',
    description: 'Get a specific application user profile by ID',
    tags: ['Users'],
  }),

  validator('param', z.object({ userId: z.string() })),

  describeResponse(
    async (c) => {
      const userId = c.req.param('userId')
      const user = await getUserById(userId)

      if (!user) {
        return c.json({ message: 'User not found' }, 404)
      }

      return c.json(user, 200)
    },
    {
      200: {
        description: 'The requested application user profile',
        content: {
          'application/json': {
            vSchema: userSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'User not found']]),
    },
  ),
)

export default router

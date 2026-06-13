import { returnsResponseErrors } from '@/api/docs/errors'
import { personIdParamsSchema, personSchema } from '@/api/models/people'
import { getPersonById } from '@/api/services/people'
import { Hono } from 'hono'
import { describeResponse, describeRoute, validator } from 'hono-openapi'

const router = new Hono()

router.get(
  '/:id',

  describeRoute({
    operationId: 'getPersonById',
    description: 'Get a specific application person profile by ID',
    tags: ['People'],
  }),

  validator('param', personIdParamsSchema),

  describeResponse(
    async (c) => {
      const id = c.req.param('id')
      const person = await getPersonById(id)

      if (!person) {
        return c.json({ message: 'Person not found' }, 404)
      }

      return c.json(person, 200)
    },
    {
      200: {
        description: 'The requested application person profile',
        content: {
          'application/json': {
            vSchema: personSchema,
          },
        },
      },
      ...returnsResponseErrors([[404, 'Person not found']]),
    },
  ),
)

export default router

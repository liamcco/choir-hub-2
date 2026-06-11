import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import {
  adminPeopleResponseSchema,
  personIdParamsSchema,
  personSchema,
  provisionPeopleResponseSchema,
  provisionPeopleSchema,
} from '@/api/models/people'
import { errorResponseSchema } from '@/api/models/utils'
import { getAdminPeople, getPersonById, provisionPeople } from '@/api/services/personService'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getPeople',
    description: 'Get provisioned people with their Better Auth user details',
  }),

  describeResponse(
    async (c) => {
      const people = await getAdminPeople()

      return c.json({ people }, 200)
    },
    {
      200: {
        description: 'Provisioned people with Better Auth user details',
        content: {
          'application/json': {
            vSchema: adminPeopleResponseSchema,
          },
        },
      },
    },
  ),
)

router.get(
  '/:id',

  describeRoute({
    operationId: 'getPersonById',
    description: 'Get a specific application person profile by ID',
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
      404: {
        description: 'Person not found',
        content: {
          'application/json': {
            vSchema: errorResponseSchema,
          },
        },
      },
    },
  ),
)

router.post(
  '/',

  describeRoute({
    operationId: 'provisionPeople',
    description: 'Create Better Auth users and matching application person profiles',
    responses: {
      200: {
        description: 'Provisioning results',
        content: {
          'application/json': {
            schema: resolver(provisionPeopleResponseSchema),
          },
        },
      },
    },
  }),

  validator('json', provisionPeopleSchema),

  async (c) => {
    const body = c.req.valid('json')
    const provisionedPeople = await provisionPeople(body)

    return c.json(provisionedPeople, 200)
  },
)

export default router

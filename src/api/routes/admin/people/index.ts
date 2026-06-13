import { Hono } from 'hono'
import { describeResponse, describeRoute, resolver, validator } from 'hono-openapi'

import {
  adminPeopleResponseSchema,
  provisionPeopleRequestSchema,
  provisionPeopleResponseSchema,
} from '@/api/models/people'
import { getAdminPeople, provisionPeople } from '@/api/services/people/personService'
import peopleByIdRouter from './:id'

const router = new Hono()

router.get(
  '/',

  describeRoute({
    operationId: 'getPeople',
    description: 'Get provisioned people with their Better Auth user details',
    tags: ['People'],
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

router.post(
  '/',

  describeRoute({
    operationId: 'provisionPeople',
    description: 'Create Better Auth users and matching application person profiles',
    tags: ['People'],
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

  validator('json', provisionPeopleRequestSchema),

  async (c) => {
    const body = c.req.valid('json')
    const provisionedPeople = await provisionPeople(body)

    return c.json(provisionedPeople, 200)
  },
)

router.route('/', peopleByIdRouter)
export default router

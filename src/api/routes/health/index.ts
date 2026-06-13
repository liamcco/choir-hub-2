import { Hono } from 'hono'
import * as z from 'zod'

import { checkHealth } from '@/api/services/healthService'
import { describeResponse, describeRoute } from 'hono-openapi'

const router = new Hono()

const responseSchema = z.string()

router.get(
  '/',
  describeRoute({
    operationId: 'checkHealth',
    description: 'Get system health status',
    tags: ['Status'],
  }),
  describeResponse(
    async (c) => {
      const status = await checkHealth()
      return c.text(`Health status: ${status}`)
    },
    {
      200: {
        description: 'Successful response',
        content: {
          'text/plain': { vSchema: responseSchema },
        },
      },
    },
  ),
)

export default router

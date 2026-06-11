import { Hono } from 'hono';

const router = new Hono();

import * as z from 'zod';

const responseSchema = z.string();

import { checkHealth } from '@/api/services/healthService';
import { describeRoute, resolver } from 'hono-openapi';

router.get(
  '/',
  describeRoute({
    operationId: 'checkHealth',
    description: 'Get system health status',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'text/plain': { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  async (c) => {
    const status = await checkHealth();
    return c.text(`Health status: ${status}`);
  },
);

export default router;

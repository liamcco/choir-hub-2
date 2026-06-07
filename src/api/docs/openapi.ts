import type { GenerateSpecOptions } from 'hono-openapi'

export const openApiOptions = {
  // includeEmptyPaths: true,
  documentation: {
    openapi: '3.2.0',
    info: {
      title: 'CSK API',
      version: '1.0.0',
      description: 'Chalmers Sångkörs heliga API',
    },
    servers: [
      {
        url: process.env.API_BASE_URL ?? 'http://localhost:3000',
      },
    ],
  },
} satisfies Partial<GenerateSpecOptions>

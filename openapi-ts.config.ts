import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? process.env.OPENAPI_SPEC_PATH ?? '.openapi/openapi.json',
  output: 'src/lib/api-client',
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '@/lib/hey-api',
    },
    '@hey-api/sdk',
    'zod',
    '@tanstack/react-query',
  ],
})

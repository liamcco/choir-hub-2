import { resolver } from 'hono-openapi'

import { errorResponseSchema } from '@/api/models/utils'

type ErrorResponseDefinition = readonly [status: number, description: string]

type ResponseErrorMap<T extends readonly ErrorResponseDefinition[]> = {
  [Entry in T[number] as Entry[0]]: {
    description: Entry[1]
    content: {
      'application/json': {
        vSchema: typeof errorResponseSchema
      }
    }
  }
}

export function returnsErrors(errors: readonly ErrorResponseDefinition[]) {
  return Object.fromEntries(
    errors.map(([status, description]) => [
      status,
      {
        description,
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    ]),
  )
}

export function returnsResponseErrors<const T extends readonly ErrorResponseDefinition[]>(
  errors: T,
): ResponseErrorMap<T> {
  return Object.fromEntries(
    errors.map(([status, description]) => [
      status,
      {
        description,
        content: {
          'application/json': {
            vSchema: errorResponseSchema,
          },
        },
      },
    ]),
  ) as ResponseErrorMap<T>
}

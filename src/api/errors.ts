import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export class ApiError extends Error {
  readonly name = 'ApiError'

  constructor(
    message: string,
    public readonly status: 400 | 401 | 403 | 404 | 409 | 422 = 400,
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown, c: Context) {
  if (error instanceof ApiError) {
    return c.json({ message: error.message }, error.status)
  }

  if (error instanceof HTTPException) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

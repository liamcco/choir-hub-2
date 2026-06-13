import { Context } from 'hono'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409 = 400,
  ) {
    super(message)
  }
}

export function handleServiceError(c: Context, error: unknown) {
  if (error instanceof ApiError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

export function handleServiceQueryError(c: Context, error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return c.json({ message: error.message }, 404)
  }

  throw error
}

import { Context } from 'hono'

export class GroupServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409 = 400,
  ) {
    super(message)
  }
}

export function handleGroupServiceError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError) {
    return c.json({ message: error.message }, error.status)
  }

  throw error
}

export function handleGroupServiceGetError(c: Context, error: unknown) {
  if (error instanceof GroupServiceError && error.status === 404) {
    return c.json({ message: error.message }, 404)
  }

  throw error
}

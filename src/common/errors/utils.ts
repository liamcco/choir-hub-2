export function getErrorMessage(error: unknown): string | null {
  return findErrorMessage(error, new Set())
}

function findErrorMessage(value: unknown, seen: Set<unknown>): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value || null
  }

  if (typeof value !== 'object') {
    return null
  }

  if (seen.has(value)) {
    return null
  }

  seen.add(value)

  if (value instanceof Error && value.message) {
    return value.message
  }

  const record = value as Record<string, unknown>

  for (const key of ['message', 'error', 'body', 'data', 'cause']) {
    if (key in record) {
      const message = findErrorMessage(record[key], seen)

      if (message) {
        return message
      }
    }
  }

  return null
}

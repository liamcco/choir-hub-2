export function getErrorMessage(error: unknown): string | null {
  return findErrorMessage(error, new Set())
}

function findErrorMessage(value: unknown, seen: Set<unknown>): string | null {
  if (typeof value === 'string') {
    return value || null
  }

  if (!isSearchableErrorValue(value, seen)) {
    return null
  }

  seen.add(value)

  if (value instanceof Error && value.message) {
    return value.message
  }

  for (const nestedValue of getNestedErrorValues(value)) {
    const message = findErrorMessage(nestedValue, seen)

    if (message) {
      return message
    }
  }

  return null
}

function isSearchableErrorValue(value: unknown, seen: Set<unknown>): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !seen.has(value)
}

function getNestedErrorValues(value: Record<string, unknown>): unknown[] {
  return ['message', 'error', 'body', 'data', 'cause'].flatMap((key) => (key in value ? [value[key]] : []))
}

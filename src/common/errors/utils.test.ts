import { describe, expect, test } from 'bun:test'

import { getErrorMessage } from './utils'

describe('getErrorMessage', () => {
  test('returns direct and nested error messages', () => {
    expect(getErrorMessage(new Error('Direct failure'))).toBe('Direct failure')
    expect(getErrorMessage({ body: { data: { message: 'Nested failure' } } })).toBe('Nested failure')
  })

  test('returns null for circular objects without a message', () => {
    const error: Record<string, unknown> = {}
    error.cause = error

    expect(getErrorMessage(error)).toBeNull()
  })
})

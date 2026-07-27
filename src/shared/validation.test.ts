import { describe, expect, test } from 'bun:test'
import { isEmail } from './validation'

describe('shared validation', () => {
  test('recognizes trimmed valid email addresses and rejects malformed values', () => {
    expect(isEmail(' ada@example.com ')).toBe(true)
    expect(isEmail('not-an-email')).toBe(false)
  })
})

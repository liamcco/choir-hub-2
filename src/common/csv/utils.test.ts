import { describe, expect, test } from 'bun:test'

import { parseUsersCsv } from './utils'

describe('parseUsersCsv', () => {
  test('parses valid users and preserves row numbers for invalid rows', () => {
    const result = parseUsersCsv(
      [
        'name,email',
        'Ada Lovelace,ada@example.com',
        ',missing-name@example.com',
        'Invalid Email,not-an-email',
        ',',
      ].join('\n'),
    )

    expect(result.users).toEqual([{ name: 'Ada Lovelace', email: 'ada@example.com' }])
    expect(result.failed).toEqual([
      {
        rowNumber: 3,
        name: '',
        email: 'missing-name@example.com',
        message: 'Name is required',
      },
      {
        rowNumber: 4,
        name: 'Invalid Email',
        email: 'not-an-email',
        message: 'Invalid email address',
      },
    ])
  })

  test('handles quoted fields with commas, escaped quotes, and newlines', () => {
    const result = parseUsersCsv('email,name\r\n"ada@example.com","Ada, ""Countess""\r\nLovelace"')

    expect(result).toEqual({
      users: [{ email: 'ada@example.com', name: 'Ada, "Countess"\r\nLovelace' }],
      failed: [],
    })
  })

  test('requires a header with name and email columns', () => {
    expect(() => parseUsersCsv('name\nAda')).toThrow('CSV must include name and email columns.')
  })
})

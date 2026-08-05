import { describe, expect, test } from 'bun:test'
import { loginSchema } from './schemas'

describe('login form schema', () => {
  test('trims the email or username before authentication', () => {
    expect(
      loginSchema.parse({
        identifier: ' member@example.com ',
        password: 'correct horse battery staple',
        rememberMe: false,
      }),
    ).toEqual({
      identifier: 'member@example.com',
      password: 'correct horse battery staple',
      rememberMe: false,
    })
  })
})

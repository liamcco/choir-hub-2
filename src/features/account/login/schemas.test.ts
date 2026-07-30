import { describe, expect, test } from 'bun:test'
import { loginSchema } from './schemas'

describe('login form schema', () => {
  test('trims the email before authentication', () => {
    expect(
      loginSchema.parse({
        email: ' member@example.com ',
        password: 'correct horse battery staple',
        rememberMe: false,
      }),
    ).toEqual({
      email: 'member@example.com',
      password: 'correct horse battery staple',
      rememberMe: false,
    })
  })
})

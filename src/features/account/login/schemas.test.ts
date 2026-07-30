import { describe, expect, test } from 'bun:test'
import { parseFormData } from '@/shared/forms/parsing'
import { loginSchema } from './schemas'

describe('login form schema', () => {
  test('trims the email before authentication', () => {
    const formData = new FormData()
    formData.set('email', ' member@example.com ')
    formData.set('password', 'correct horse battery staple')

    expect(parseFormData(loginSchema, formData)).toEqual({
      success: true,
      data: { email: 'member@example.com', password: 'correct horse battery staple' },
    })
  })
})

import { describe, expect, test } from 'bun:test'
import { parseFormData } from '@/shared/forms/parsing'
import { passwordResetSchema } from './schemas'

describe('password reset schema', () => {
  test('requires matching password confirmation', () => {
    const formData = new FormData()
    formData.set('password', 'correct horse battery staple')
    formData.set('confirmPassword', 'different password')

    const result = parseFormData(passwordResetSchema, formData)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.fieldErrors.confirmPassword).toEqual(['Passwords do not match.'])
  })
})

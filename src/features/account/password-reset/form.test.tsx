import { describe, expect, test } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { PasswordResetForm } from './password-reset-form'
import { PasswordResetRequestForm } from './password-reset-request-form'

describe('password reset forms', () => {
  test('shows email validation before requesting a reset link', async () => {
    const { container, getByRole } = render(<PasswordResetRequestForm onSuccess={() => {}} />)

    fireEvent.change(getByRole('textbox', { name: 'Email' }), { target: { value: 'not-an-email' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    await waitFor(() => {
      expect(getByRole('alert').textContent).toBe('Email must be a valid email address.')
    })
  })

  test('shows password validation before resetting the password', async () => {
    const { container, getAllByRole } = render(<PasswordResetForm token="valid-token" onSuccess={() => {}} />)

    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    await waitFor(() => {
      const messages = getAllByRole('alert').map((alert) => alert.textContent)
      expect(messages).toContain('Password must be at least 8 characters.')
      expect(messages).toContain('Confirm password must be at least 8 characters.')
    })
  })
})

import { describe, expect, mock, test } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('next/navigation', () => ({
  useRouter: () => ({ refresh: mock() }),
}))

import { PasswordChangeForm } from '@/features/account/self-service/password-change-form'
import { AccountSelfServiceScreen } from '@/features/account/self-service/screen'

describe('account self-service screen', () => {
  test('renders password self-service without admin account management controls', () => {
    const markup = renderToStaticMarkup(
      <AccountSelfServiceScreen user={{ name: 'Member Name', email: 'member@example.com', username: 'member' }} />,
    )

    expect(markup).toContain('Account')
    expect(markup).toContain('member@example.com')
    expect(markup).toContain('Member Name')
    expect(markup).toContain('@member')
    expect(markup).toContain('Current password')
    expect(markup).toContain('New password')
    expect(markup).toContain('Update password')
    expect(markup).toContain('Passkeys')
    expect(markup).toContain('Add passkey')
    expect(markup).toContain('Username')
    expect(markup).toContain('Update username')
    expect(markup).not.toContain('Create account')
    expect(markup).not.toContain('Member Status')
    expect(markup).not.toContain('Disable')
  })

  test('shows client validation errors before invoking the server action', async () => {
    const { container, getAllByRole } = render(<PasswordChangeForm />)
    const form = container.querySelector('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)

    await waitFor(() => {
      const messages = getAllByRole('alert').map((alert) => alert.textContent)
      expect(messages).toContain('Current password must be at least 8 characters.')
      expect(messages).toContain('New password must be at least 8 characters.')
      expect(messages).toContain('Confirm password must be at least 8 characters.')
    })
  })
})

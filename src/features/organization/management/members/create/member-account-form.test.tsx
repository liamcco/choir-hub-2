import { beforeEach, describe, expect, mock, test } from 'bun:test'

const createUserAction = mock(async () => ({
  success: false as const,
  fieldErrors: { email: 'Email already taken' },
}))

mock.module('@/features/organization/management/members/actions', () => ({
  createUserAction,
}))

const { cleanup, render, screen, waitFor } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default
const { MemberAccountForm } = await import('./member-account-form')

beforeEach(() => {
  cleanup()
  createUserAction.mockClear()
})

describe('Member account form', () => {
  test('keeps entered values when the action returns field errors', async () => {
    const user = userEvent.setup()
    render(<MemberAccountForm />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Temporary password'), 'correct horse battery staple')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada Lovelace')
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('ada@example.com')
    expect((screen.getByLabelText('Temporary password') as HTMLInputElement).value).toBe('correct horse battery staple')
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Email already taken')
  })
})

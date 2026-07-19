import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccountSelfServiceScreen } from '@/account-self-service/screen'

describe('account self-service screen', () => {
  test('renders password self-service without admin account management controls', () => {
    const markup = renderToStaticMarkup(<AccountSelfServiceScreen userEmail="member@example.com" />)

    expect(markup).toContain('Account')
    expect(markup).toContain('member@example.com')
    expect(markup).toContain('Current password')
    expect(markup).toContain('New password')
    expect(markup).toContain('Update password')
    expect(markup).not.toContain('Create account')
    expect(markup).not.toContain('Member Status')
    expect(markup).not.toContain('Disable')
  })
})

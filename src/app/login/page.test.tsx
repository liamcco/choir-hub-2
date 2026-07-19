import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { LoginScreen } from '@/app/login/page'

describe('login page', () => {
  test('renders email password login without public self-registration', () => {
    const markup = renderToStaticMarkup(<LoginScreen form={<div>Email Password Sign in</div>} />)

    expect(markup).toContain('Sign in')
    expect(markup).toContain('Email')
    expect(markup).toContain('Password')
    expect(markup).not.toContain('Sign up')
    expect(markup).not.toContain('Create account')
  })
})

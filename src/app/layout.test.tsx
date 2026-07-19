import { describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('@wrksz/themes/next', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

mock.module('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

const { default: AuthenticatedAppLayout } = await import('@/app/(app)/layout')
const { LoginScreen } = await import('@/app/(public)/login/page')
const { default: RootLayout } = await import('@/app/layout')

describe('app layouts', () => {
  test('root layout renders public login content without authenticated app navigation', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <LoginScreen form={<div>Email Password Sign in</div>} />
      </RootLayout>,
    )

    expect(markup).toContain('Sign in')
    expect(markup).not.toContain('Primary navigation')
    expect(markup).not.toContain('CSK Choir Hub')
  })

  test('authenticated route group layout renders app navigation around authenticated pages', () => {
    const markup = renderToStaticMarkup(
      <AuthenticatedAppLayout>
        <main>Authenticated page</main>
      </AuthenticatedAppLayout>,
    )

    expect(markup).toContain('Primary navigation')
    expect(markup).toContain('CSK Choir Hub')
    expect(markup).toContain('Authenticated page')
  })
})

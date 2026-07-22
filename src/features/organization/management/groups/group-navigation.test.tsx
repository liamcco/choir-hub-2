import { beforeEach, describe, expect, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const { cleanup, render, screen } = await import('@testing-library/react')
const { GroupDetailRoutePresentation } = await import('./group-detail-presentation')

beforeEach(cleanup)

describe('Group detail navigation presentations', () => {
  test('in-app selection presents a named dialog while retaining the collection', () => {
    render(
      <>
        <main>
          <h1>Groups</h1>
          <p>Group collection</p>
        </main>
        <AppRouterContext.Provider value={router}>
          <GroupDetailRoutePresentation name="Altos" presentation="intercepted">
            <h1>Altos</h1>
          </GroupDetailRoutePresentation>
        </AppRouterContext.Provider>
      </>,
    )

    expect(screen.getByRole('dialog', { name: 'Altos' })).toBeTruthy()
    expect(screen.getByText('Group collection')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Altos detail content' })).toBeTruthy()
  })

  test('direct loading presents the same detail as standalone content', () => {
    render(
      <GroupDetailRoutePresentation presentation="standalone">
        <h1>Altos</h1>
      </GroupDetailRoutePresentation>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Altos' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('link', { name: 'Close' }).getAttribute('href')).toBe('/admin/groups')
  })
})

const router = {
  back() {},
  forward() {},
  prefetch: async () => {},
  push() {},
  refresh() {},
  replace() {},
} as never

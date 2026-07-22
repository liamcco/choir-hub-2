import { beforeEach, describe, expect, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const { cleanup, render, screen } = await import('@testing-library/react')
const { PositionDetailRoutePresentation } = await import('./position-detail-presentation')
beforeEach(cleanup)
describe('Position detail navigation presentations', () => {
  test('in-app selection presents detail over the collection', () => {
    render(
      <>
        <main>
          <h1>Positions</h1>
          <p>Position collection</p>
        </main>
        <AppRouterContext.Provider value={router}>
          <PositionDetailRoutePresentation name="Chair" presentation="intercepted">
            <h1>Chair</h1>
          </PositionDetailRoutePresentation>
        </AppRouterContext.Provider>
      </>,
    )
    expect(screen.getByRole('dialog', { name: 'Chair' })).toBeTruthy()
    expect(screen.getByText('Position collection')).toBeTruthy()
  })
  test('direct loading presents standalone detail with Close', () => {
    render(
      <PositionDetailRoutePresentation presentation="standalone">
        <h1>Chair</h1>
      </PositionDetailRoutePresentation>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('link', { name: 'Close' }).getAttribute('href')).toBe('/admin/positions')
  })
})
const router = { back() {}, forward() {}, prefetch: async () => {}, push() {}, refresh() {}, replace() {} } as never

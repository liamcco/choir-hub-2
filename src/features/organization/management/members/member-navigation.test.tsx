import { beforeEach, describe, expect, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const { cleanup, render, screen } = await import('@testing-library/react')
const { MemberDetailRoutePresentation } = await import('./member-detail-presentation')

beforeEach(cleanup)

describe('Member detail navigation presentations', () => {
  test('in-app selection presents a named dialog while retaining the collection', () => {
    render(
      <>
        <main>
          <h1>Members</h1>
          <p>Member collection</p>
        </main>
        <AppRouterContext.Provider value={router}>
          <MemberDetailRoutePresentation name="Ada Lovelace" presentation="intercepted">
            <h1>Ada Lovelace</h1>
          </MemberDetailRoutePresentation>
        </AppRouterContext.Provider>
      </>,
    )

    expect(screen.getByRole('dialog', { name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.getByText('Member collection')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Ada Lovelace detail content' })).toBeTruthy()
  })

  test('direct loading presents the same detail as standalone content', () => {
    render(
      <MemberDetailRoutePresentation presentation="standalone">
        <h1>Ada Lovelace</h1>
      </MemberDetailRoutePresentation>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('link', { name: 'Close' }).getAttribute('href')).toBe('/admin/members')
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

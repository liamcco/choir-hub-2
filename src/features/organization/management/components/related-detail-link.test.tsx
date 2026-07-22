import { beforeEach, describe, expect, test } from 'bun:test'
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'

const { cleanup, render, screen } = await import('@testing-library/react')
const { RelatedDetailLink } = await import('./related-detail-link')

beforeEach(cleanup)

describe('related detail navigation', () => {
  test('uses the owning collection detail query parameter', () => {
    render(
      <PathnameContext.Provider value="/admin/members">
        <SearchParamsContext.Provider value={new URLSearchParams()}>
          <RelatedDetailLink href="/admin/groups?detail=group-1">Chamber Choir</RelatedDetailLink>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>,
    )

    expect(screen.getByRole('link', { name: 'Chamber Choir' }).getAttribute('href')).toBe(
      '/admin/groups?detail=group-1',
    )
  })
})

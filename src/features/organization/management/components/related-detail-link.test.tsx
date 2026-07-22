import { beforeEach, describe, expect, test } from 'bun:test'
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'

const { cleanup, render, screen } = await import('@testing-library/react')
const { RelatedDetailLink } = await import('./related-detail-link')

beforeEach(cleanup)

describe('related detail navigation', () => {
  test('preserves the originating detail so related navigation can replace it and return', () => {
    render(
      <PathnameContext.Provider value="/admin/members/member-1">
        <SearchParamsContext.Provider value={new URLSearchParams()}>
          <RelatedDetailLink href="/admin/groups/group-1">Chamber Choir</RelatedDetailLink>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>,
    )

    expect(screen.getByRole('link', { name: 'Chamber Choir' }).getAttribute('href')).toBe(
      '/admin/groups/group-1?detailOrigin=%2Fadmin%2Fmembers%2Fmember-1',
    )
  })
})

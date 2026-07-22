import { beforeEach, describe, expect, test } from 'bun:test'
import { PositionCollection } from './position-collection'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default
beforeEach(cleanup)

describe('Position collection', () => {
  test('shows duplicate Position names separately with scopes, occupancy, and vacancy in the four-column collection', () => {
    render(
      <PositionCollection
        positions={[
          {
            id: 'position-1',
            name: 'Chair',
            scopeLabel: 'Choir Board',
            currentHolder: 'Ada Lovelace',
            heldSince: new Date('2025-01-15'),
          },
          { id: 'position-2', name: 'Chair', scopeLabel: 'Festival Committee', currentHolder: null, heldSince: null },
        ]}
      />,
    )
    expect(screen.getAllByRole('columnheader').map((heading) => heading.textContent)).toEqual([
      'Name',
      'Group scope',
      'Current holder',
      'Held since',
    ])
    expect(screen.getAllByRole('link', { name: 'Chair' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Chair' })[0]?.getAttribute('href')).toBe(
      '/admin/positions?detail=position-1',
    )
    expect(screen.getByText('Choir Board')).toBeTruthy()
    expect(screen.getByText('Festival Committee')).toBeTruthy()
    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    expect(screen.getByText('Jan 15, 2025')).toBeTruthy()
    expect(screen.getAllByText('Vacant')).toHaveLength(2)
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()
  })

  test('transiently searches every displayed Position value', async () => {
    const user = userEvent.setup()
    render(
      <PositionCollection
        positions={[
          {
            id: 'position-1',
            name: 'Chair',
            scopeLabel: 'Choir Board',
            currentHolder: 'Ada Lovelace',
            heldSince: new Date('2025-01-15'),
          },
          {
            id: 'position-2',
            name: 'Librarian',
            scopeLabel: 'Festival Committee',
            currentHolder: null,
            heldSince: null,
          },
        ]}
      />,
    )
    const search = screen.getByRole('searchbox', { name: 'Search Positions' })
    await user.type(search, 'festival')
    expect(screen.getByRole('status').textContent).toBe('1 of 2 Positions displayed')
    expect(screen.getByRole('link', { name: 'Librarian' })).toBeTruthy()
    await user.clear(search)
    await user.type(search, 'jan 15')
    expect(screen.getByRole('link', { name: 'Chair' })).toBeTruthy()
    expect(window.location.search).toBe('')
  })
})

import { beforeEach, describe, expect, test } from 'bun:test'
import { GroupCollection } from './group-collection'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

describe('Group collection', () => {
  test('groups all Groups by scope, keeps member counts, and searches displayed values', async () => {
    const user = userEvent.setup()
    render(
      <GroupCollection
        groups={[
          {
            id: 'choir-1',
            name: 'Chamber Choir',
            scope: 'CSK',
            memberCount: 1,
          },
          {
            id: 'mk-1',
            name: 'Altos',
            scope: 'MK',
            memberCount: 7,
          },
          { id: 'kk-1', name: 'Board', scope: 'KK', memberCount: 0 },
          { id: 'mk-2', name: 'Concerts', scope: 'MK', memberCount: 2 },
        ]}
      />,
    )

    expect(screen.getAllByRole('columnheader').map((heading) => heading.textContent)).toEqual(['Name', 'Members'])
    expect(screen.getByRole('link', { name: 'Chamber Choir' }).getAttribute('href')).toBe(
      '/admin/groups?detail=choir-1',
    )
    expect(screen.getByRole('cell', { name: '0' })).toBeTruthy()
    expect(screen.getByRole('cell', { name: '7' })).toBeTruthy()
    expect(screen.getByText('KK')).toBeTruthy()
    expect(screen.getByText('MK')).toBeTruthy()
    expect(screen.queryByText('CSK')).toBeNull()
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Chamber Choir',
      'Board',
      'Altos',
      'Concerts',
    ])
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()

    const search = screen.getByRole('searchbox', { name: 'Search Groups' })
    await user.type(search, 'mk')
    expect(screen.getByRole('status').textContent).toBe('2 of 4 Groups displayed')
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Concerts' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Chamber Choir' })).toBeNull()

    await user.clear(search)
    await user.type(search, '7')
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
    expect(window.location.search).toBe('')
  })
})

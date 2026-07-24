import { beforeEach, describe, expect, test } from 'bun:test'
import { GroupCollection } from './group-collection'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

describe('Group collection', () => {
  test('shows the four-column direct-membership collection and searches every displayed value', async () => {
    const user = userEvent.setup()
    render(
      <GroupCollection
        groups={[
          {
            id: 'choir-1',
            name: 'Chamber Choir',
            kind: 'COMMITTEE',
            scope: 'CSK-wide',
            memberCount: 1,
          },
          {
            id: 'section-1',
            name: 'Altos',
            kind: 'COMMITTEE',
            scope: 'Manskören',
            memberCount: 7,
          },
        ]}
      />,
    )

    expect(screen.getAllByRole('columnheader').map((heading) => heading.textContent)).toEqual([
      'Name',
      'Kind',
      'Scope',
      'Members',
    ])
    expect(screen.getByRole('link', { name: 'Chamber Choir' }).getAttribute('href')).toBe(
      '/admin/groups?detail=choir-1',
    )
    expect(screen.getByRole('cell', { name: '1' })).toBeTruthy()
    expect(screen.getByRole('cell', { name: '7' })).toBeTruthy()
    expect(screen.getByText('CSK-wide')).toBeTruthy()
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()

    const search = screen.getByRole('searchbox', { name: 'Search Groups' })
    await user.type(search, 'manskören')
    expect(screen.getByRole('status').textContent).toBe('1 of 2 Groups displayed')
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Chamber Choir' })).toBeNull()

    await user.clear(search)
    await user.type(search, '7')
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
    expect(window.location.search).toBe('')
  })
})

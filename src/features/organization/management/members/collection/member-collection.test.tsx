import { beforeEach, describe, expect, test } from 'bun:test'
import { MemberStatus } from '@/drizzle/schema'
import { MemberCollection } from './member-collection'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

describe('Member collection', () => {
  test('shows shortened Choir and bare Voice Type values in the four-column collection', () => {
    render(
      <MemberCollection
        users={[
          {
            id: 'member-1',
            name: 'Ada Lovelace',
            homeChoir: 'KK',
            voice: 'A1',
            status: MemberStatus.ACTIVE,
          },
          {
            id: 'member-2',
            name: 'Grace Hopper',
            homeChoir: null,
            voice: null,
            status: MemberStatus.PASSIVE,
          },
        ]}
      />,
    )

    expect(screen.getAllByRole('columnheader').map((heading) => heading.textContent)).toEqual([
      'Name',
      'Choir',
      'Voice',
      'Status',
    ])
    expect(screen.getByRole('link', { name: 'Ada Lovelace' }).getAttribute('href')).toBe('/admin/users?detail=member-1')
    expect(screen.getByText('KK')).toBeTruthy()
    expect(screen.getByText('A1')).toBeTruthy()
    expect(screen.getAllByText(/No (Choir|Voice)/)).toHaveLength(2)
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()
  })

  test('searches every displayed textual value and reports the displayed result count', async () => {
    const user = userEvent.setup()
    render(
      <MemberCollection
        users={[
          {
            id: 'member-1',
            name: 'Ada Lovelace',
            homeChoir: 'KK',
            voice: 'A1',
            status: MemberStatus.ACTIVE,
          },
          {
            id: 'member-2',
            name: 'Grace Hopper',
            homeChoir: 'DK',
            voice: 'S1',
            status: MemberStatus.PASSIVE,
          },
          {
            id: 'member-3',
            name: 'Katherine Johnson',
            homeChoir: null,
            voice: null,
            status: MemberStatus.FORMER,
          },
        ]}
      />,
    )

    const search = screen.getByRole('searchbox', { name: 'Search Users' })
    await user.type(search, 'former')

    expect(screen.getByRole('status').textContent).toBe('1 of 3 Users displayed')
    expect(screen.getByRole('link', { name: 'Katherine Johnson' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Ada Lovelace' })).toBeNull()

    await user.clear(search)
    await user.type(search, 'dk')

    expect(screen.getByRole('link', { name: 'Grace Hopper' })).toBeTruthy()
    expect(window.location.search).toBe('')
  })
})

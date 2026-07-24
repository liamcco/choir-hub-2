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

  test('groups filtered users by the selected column and keeps names sorted within each group', async () => {
    const user = userEvent.setup()
    render(
      <MemberCollection
        users={[
          { id: 'former', name: 'Ada Lovelace', homeChoir: 'KK', voice: 'A1', status: MemberStatus.FORMER },
          { id: 'active-2', name: 'Grace Hopper', homeChoir: 'KK', voice: 'S1', status: MemberStatus.ACTIVE },
          { id: 'active-1', name: 'Zoe Quinn', homeChoir: 'MK', voice: 'B2', status: MemberStatus.ACTIVE },
          { id: 'passive', name: 'Bob Stone', homeChoir: 'DK', voice: 'S2', status: MemberStatus.PASSIVE },
          { id: 'unplaced', name: 'No Placement', homeChoir: null, voice: null, status: MemberStatus.PASSIVE },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Status' }))
    expect(
      screen
        .getAllByRole('cell')
        .filter((cell) => cell.getAttribute('colspan') === '4')
        .map((cell) => cell.textContent),
    ).toEqual(['Active', 'Passive', 'Former'])
    expect(screen.getByRole('button', { name: 'Status' }).getAttribute('aria-pressed')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Voice' }))
    expect(
      screen
        .getAllByRole('cell')
        .filter((cell) => cell.getAttribute('colspan') === '4')
        .map((cell) => cell.textContent),
    ).toEqual(['S1', 'S2', 'A1', 'B2', 'No Voice'])

    await user.click(screen.getByRole('button', { name: 'Choir' }))
    expect(
      screen
        .getAllByRole('cell')
        .filter((cell) => cell.getAttribute('colspan') === '4')
        .map((cell) => cell.textContent),
    ).toEqual(['MK', 'B2', 'KK', 'S1', 'A1', 'DK', 'S2', 'No Choir', 'No Voice'])

    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(screen.getAllByRole('cell').filter((cell) => cell.getAttribute('colspan') === '4')).toHaveLength(0)
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Ada Lovelace',
      'Bob Stone',
      'Grace Hopper',
      'No Placement',
      'Zoe Quinn',
    ])
  })
})

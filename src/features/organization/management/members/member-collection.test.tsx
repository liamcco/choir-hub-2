import { beforeEach, describe, expect, test } from 'bun:test'
import { MemberStatus } from '@/prisma/generated/client'
import { MemberCollection } from './member-collection'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

describe('Member collection', () => {
  test('shows each Member with every current Choir and Voice in the four-column collection', () => {
    render(
      <MemberCollection
        members={[
          {
            id: 'member-1',
            name: 'Ada Lovelace',
            choirs: ['Chamber Choir', 'Festival Choir'],
            voices: ['Alto I', 'Alto II'],
            status: MemberStatus.ACTIVE,
          },
          {
            id: 'member-2',
            name: 'Grace Hopper',
            choirs: [],
            voices: [],
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
    expect(screen.getByRole('link', { name: 'Ada Lovelace' }).getAttribute('href')).toBe('/admin/members/member-1')
    expect(screen.getByText('Chamber Choir, Festival Choir')).toBeTruthy()
    expect(screen.getByText('Alto I, Alto II')).toBeTruthy()
    expect(screen.getByLabelText('Multiple current Voices')).toBeTruthy()
    expect(screen.getAllByText('Not assigned')).toHaveLength(2)
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()
  })

  test('searches every displayed textual value and reports the displayed result count', async () => {
    const user = userEvent.setup()
    render(
      <MemberCollection
        members={[
          {
            id: 'member-1',
            name: 'Ada Lovelace',
            choirs: ['Chamber Choir'],
            voices: ['Alto I'],
            status: MemberStatus.ACTIVE,
          },
          {
            id: 'member-2',
            name: 'Grace Hopper',
            choirs: ['Festival Choir'],
            voices: ['Soprano'],
            status: MemberStatus.PASSIVE,
          },
          {
            id: 'member-3',
            name: 'Katherine Johnson',
            choirs: [],
            voices: [],
            status: MemberStatus.FORMER,
          },
        ]}
      />,
    )

    const search = screen.getByRole('searchbox', { name: 'Search Members' })
    await user.type(search, 'former')

    expect(screen.getByRole('status').textContent).toBe('1 of 3 Members displayed')
    expect(screen.getByRole('link', { name: 'Katherine Johnson' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Ada Lovelace' })).toBeNull()

    await user.clear(search)
    await user.type(search, 'festival')

    expect(screen.getByRole('link', { name: 'Grace Hopper' })).toBeTruthy()
    expect(window.location.search).toBe('')
  })
})

import { beforeEach, describe, expect, test } from 'bun:test'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default
const { GroupDetail } = await import('./group-detail')

beforeEach(cleanup)

const base = {
  id: 'board' as const,
  name: 'Board',
  kind: 'board' as const,
  users: [],
}

describe('flat Group detail', () => {
  test('shows fixed reference data and makes Board membership read-only', () => {
    render(
      <GroupDetail
        group={{
          ...base,
          currentMemberships: [
            {
              id: 'm',
              groupId: 'board',
              userId: 'u',
              userLabel: 'Ada',
              userDetail: 'ada@example.com',
              startsAt: new Date('2025-01-01'),
              endsAt: null,
              sourceLabels: ['Master of Gigs'],
            },
          ],
        }}
      />,
    )
    expect(screen.queryByRole('heading', { name: 'Board' })).toBeNull()
    expect(screen.getByText('Board', { selector: 'dd' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Members (1)' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Previous members' })).toBeNull()
    expect(screen.queryByText('CSK-wide')).toBeNull()
    expect(screen.queryByText('Group Kind')).toBeNull()
    expect(screen.queryByText('Scope')).toBeNull()
    expect(screen.getByText('Master of Gigs')).toBeTruthy()
    expect(screen.queryByText('ada@example.com')).toBeNull()
    expect(screen.queryByRole('button', { name: /add user/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /edit group/i })).toBeNull()
  })

  test('labels a deduplicated effective member with both sources', () => {
    render(
      <GroupDetail
        group={{
          ...base,
          id: 'concert-mastery',
          kind: 'committee',
          name: 'Concert Mastery',
          currentMemberships: [
            {
              id: 'm',
              groupId: 'concert-mastery',
              userId: 'u',
              userLabel: 'Ada',
              userDetail: 'ada@example.com',
              startsAt: new Date('2025-01-01'),
              endsAt: null,
              sourceLabels: ['Explicit membership', 'Master of Gigs'],
            },
          ],
        }}
      />,
    )
    expect(screen.getByText('Explicit membership')).toBeTruthy()
    expect(screen.getByText('Master of Gigs')).toBeTruthy()
    expect(screen.getByText('Ada')).toBeTruthy()
  })

  test('opens Add User as a draft membership row', async () => {
    const user = userEvent.setup()
    render(
      <GroupDetail
        group={{
          ...base,
          id: 'concert-mastery',
          kind: 'committee',
          name: 'Concert Mastery',
          currentMemberships: [],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add User' }))

    expect(screen.getByLabelText('User')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
  })
})

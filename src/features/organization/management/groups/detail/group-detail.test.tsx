import { beforeEach, describe, expect, test } from 'bun:test'

const { cleanup, render, screen } = await import('@testing-library/react')
const { GroupDetail } = await import('./group-detail')

beforeEach(cleanup)

const base = {
  id: 'board',
  name: 'Board',
  kind: 'board' as const,
  scopeType: 'csk' as const,
  scopeKey: 'csk',
  choirId: null,
  users: [],
  scheduledMemberships: [],
  historicalMemberships: [],
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
        actions={{ createMembership: async () => ({}), endMembership: async () => ({}) }}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Board' })).toBeTruthy()
    expect(screen.queryByText('CSK-wide')).toBeNull()
    expect(screen.queryByText('Group Kind')).toBeNull()
    expect(screen.queryByText('Scope')).toBeNull()
    expect(screen.getByText('Master of Gigs')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /add user/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /edit group/i })).toBeNull()
  })

  test('labels a deduplicated effective member with both sources', () => {
    render(
      <GroupDetail
        group={{
          ...base,
          kind: 'committee',
          name: 'Concert Mastery',
          currentMemberships: [
            {
              id: 'm',
              groupId: 'g',
              userId: 'u',
              userLabel: 'Ada',
              userDetail: 'ada@example.com',
              startsAt: new Date('2025-01-01'),
              endsAt: null,
              sourceLabels: ['Explicit membership', 'Master of Gigs'],
            },
          ],
        }}
        actions={{ createMembership: async () => ({}), endMembership: async () => ({}) }}
      />,
    )
    expect(screen.getByText('Explicit membership')).toBeTruthy()
    expect(screen.getByText('Master of Gigs')).toBeTruthy()
    expect(screen.getByText('Ada')).toBeTruthy()
  })
})

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

const { cleanup, render, screen } = await import('@testing-library/react')
mock.module('./actions', () => ({
  updateAccountAccessAction: async () => {},
  updateMemberStatusAction: async () => {},
}))
const { MemberDetail } = await import('./member-detail')

beforeEach(cleanup)

describe('Member detail', () => {
  test('presents the Member read-first with subordinate access, current relationships, and collapsed History', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    render(
      <MemberDetail
        member={{
          id: 'member-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          status: MemberStatus.ACTIVE,
          accessState: 'enabled',
          accessRole: 'user',
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-02-01T00:00:00Z'),
          currentMemberships: [
            {
              id: 'membership-1',
              groupName: 'Chamber Choir',
              groupKind: GroupKind.CHOIR,
              startsAt: new Date('2024-08-01'),
            },
          ],
          historicalMemberships: [
            {
              id: 'membership-2',
              groupName: 'Festival Choir',
              groupKind: GroupKind.CHOIR,
              startsAt: new Date('2023-01-01'),
              endsAt: new Date('2023-12-31'),
            },
          ],
          currentAssignments: [
            {
              id: 'assignment-1',
              positionName: 'Chair',
              scopeLabel: 'Board',
              startsAt: new Date('2024-09-01'),
            },
          ],
          historicalAssignments: [],
        }}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(screen.getByText('member-1')).toBeTruthy()
    expect(screen.getByText('Feb 1, 2025')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Group Memberships' })).toBeTruthy()
    expect(screen.getByText('Chamber Choir')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Position Assignments' })).toBeTruthy()
    expect(screen.getByText('Chair')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Auth User access' })).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Member Status' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Auth User access' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Disable access' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Edit Auth User access' }))
    expect(screen.getByRole('button', { name: 'Disable access' })).toBeTruthy()

    const history = screen.getByText('History').closest('details')
    expect(history?.hasAttribute('open')).toBe(false)
    expect(screen.getByText('Festival Choir')).toBeTruthy()
  })

  test('omits History when the Member has no ended relationships', () => {
    render(
      <MemberDetail
        member={{
          id: 'member-2',
          name: 'Grace Hopper',
          email: 'grace@example.com',
          status: MemberStatus.PASSIVE,
          accessState: 'disabled',
          accessRole: 'user',
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-02-01T00:00:00Z'),
          currentMemberships: [],
          historicalMemberships: [],
          currentAssignments: [],
          historicalAssignments: [],
        }}
      />,
    )

    expect(screen.queryByText('History')).toBeNull()
    expect(screen.getByText('No current Group Memberships')).toBeTruthy()
    expect(screen.getByText('No current Position Assignments')).toBeTruthy()
  })
})

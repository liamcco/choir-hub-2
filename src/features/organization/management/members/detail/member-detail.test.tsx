import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GROUP_KINDS } from '@/core/topology'
import { MemberStatus } from '@/drizzle/schema'

const { cleanup, render, screen } = await import('@testing-library/react')
const endPositionAssignmentForm = mock(({ immediate }: { immediate?: boolean }) => (
  <button type="button">{immediate ? 'End' : 'Save end date'}</button>
))

mock.module('../../position-assignments/assignment-form', () => ({
  AssignPositionHolderControl: () => <button type="button">Assign holder</button>,
  AssignUserPositionControl: () => <button type="button">Assign Position</button>,
  EndPositionAssignmentForm: endPositionAssignmentForm,
}))
const { MemberDetail } = await import('./member-detail')

beforeEach(cleanup)

describe('Member detail', () => {
  test('presents the Member read-first with compact account details and current relationships', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    render(
      <MemberDetail
        member={{
          id: 'member-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          status: MemberStatus.ACTIVE,
          groups: [{ id: 'concert-mastery', name: 'Chamber Choir' }],
          positions: [{ id: 'president', label: 'Chair · Board' }],
          currentMemberships: [
            {
              id: 'membership-1',
              groupId: 'concert-mastery',
              groupName: 'Chamber Choir',
              groupKind: GROUP_KINDS.COMMITTEE,
              startsAt: new Date('2024-08-01'),
              endsAt: null,
            },
          ],
          currentAssignments: [
            {
              id: 'assignment-1',
              positionId: 'president',
              positionName: 'Chair',
              scopeLabel: 'Board',
              startsAt: new Date('2024-09-01'),
              endsAt: null,
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.getByText('Active')).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Impersonate' })).toBeTruthy()
    expect(screen.queryByText('member-1')).toBeNull()
    expect(screen.queryByText('user')).toBeNull()
    expect(screen.queryByText('Last updated')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Committee Memberships' })).toBeTruthy()
    expect(screen.getByText('Chamber Choir')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Position Assignments' })).toBeTruthy()
    expect(screen.getByText('Chair')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'End' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Save end date' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Membership' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Contact information' })).toBeNull()
    expect(screen.queryByRole('button', { name: /edit member status/i })).toBeNull()
    expect(screen.getByRole('button', { name: 'Add Group' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Assign Position' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Add Group' }))
    expect(screen.getByLabelText('Group')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Confirm' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Add Group Membership' })).toBeNull()

    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0])
    await user.click(screen.getByRole('button', { name: 'Assign Position' }))
    expect(screen.getByLabelText('Position')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Confirm' }).length).toBeGreaterThan(0)

    expect(screen.queryByText('History')).toBeNull()
    expect(screen.queryByText('Festival Choir')).toBeNull()
  })

  test('omits History when the Member has no ended relationships', async () => {
    render(
      <MemberDetail
        member={{
          id: 'member-2',
          name: 'Grace Hopper',
          email: 'grace@example.com',
          isAdmin: true,
          status: MemberStatus.PASSIVE,
          groups: [],
          positions: [],
          currentMemberships: [],
          currentAssignments: [],
        }}
      />,
    )

    expect(screen.getByText('No current Committee Memberships')).toBeTruthy()
    expect(screen.getByText('No current Position Assignments')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Impersonate' })).toBeNull()

    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Add Group' }))
    expect(screen.queryByText('No current Committee Memberships')).toBeNull()
    expect(screen.getByLabelText('Group')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Assign Position' }))
    expect(screen.queryByText('No current Position Assignments')).toBeNull()
    expect(screen.getByLabelText('Position')).toBeTruthy()
  })
})

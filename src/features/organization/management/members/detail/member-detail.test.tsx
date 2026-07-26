import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupKind } from '@/core/topology'
import { MemberStatus } from '@/drizzle/schema'

const { cleanup, render, screen } = await import('@testing-library/react')
mock.module('../../position-assignments/assignment-form', () => ({
  AssignPositionHolderControl: () => <button type="button">Assign holder</button>,
  AssignUserPositionControl: () => <button type="button">Assign Position</button>,
  EndPositionAssignmentForm: () => <button type="button">End</button>,
}))
mock.module('../../position-assignments/relationships', () => ({
  AssignUserPositionControl: () => <button type="button">Assign Position</button>,
  EndPositionAssignmentForm: () => <button type="button">End</button>,
}))
const { MemberDetail } = await import('./member-detail')

beforeEach(cleanup)

describe('Member detail', () => {
  test('presents the Member read-first with compact account details and current relationships', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    render(
      <MemberDetail
        actions={{
          createMembership: async () => ({}),
          endMembership: async () => ({}),
          createAssignment: async () => ({}),
          endAssignment: async () => ({}),
        }}
        member={{
          id: 'member-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          status: MemberStatus.ACTIVE,
          groups: [{ id: 'group-1', name: 'Chamber Choir' }],
          positions: [{ id: 'position-1', label: 'Chair · Board' }],
          currentMemberships: [
            {
              id: 'membership-1',
              groupId: 'group-1',
              groupName: 'Chamber Choir',
              groupKind: GroupKind.COMMITTEE,
              startsAt: new Date('2024-08-01'),
            },
          ],
          currentAssignments: [
            {
              id: 'assignment-1',
              positionId: 'position-1',
              positionName: 'Chair',
              scopeLabel: 'Board',
              startsAt: new Date('2024-09-01'),
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.getByText('Active')).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    expect(screen.queryByText('member-1')).toBeNull()
    expect(screen.queryByText('user')).toBeNull()
    expect(screen.queryByText('Last updated')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Committee Memberships' })).toBeTruthy()
    expect(screen.getByText('Chamber Choir')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Position Assignments' })).toBeTruthy()
    expect(screen.getByText('Chair')).toBeTruthy()
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
    const actions = {
      createMembership: async () => ({}),
      endMembership: async () => ({}),
      createAssignment: async () => ({}),
      endAssignment: async () => ({}),
    }
    render(
      <MemberDetail
        actions={actions}
        member={{
          id: 'member-2',
          name: 'Grace Hopper',
          email: 'grace@example.com',
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

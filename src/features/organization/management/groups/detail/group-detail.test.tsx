import { beforeEach, describe, expect, test } from 'bun:test'
import { GroupKind, MemberStatus } from '@/drizzle/schema'

const { cleanup, render, screen } = await import('@testing-library/react')
const { GroupDetail } = await import('./group-detail')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

describe('Group detail', () => {
  test('presents fields read-first and manages direct memberships with inline controls and collapsed History', async () => {
    const user = userEvent.setup()
    render(
      <GroupDetail
        actions={actions}
        group={{
          id: 'section-1',
          name: 'Altos',
          kind: GroupKind.SECTION,
          description: 'Lower treble voices',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          parentGroupId: 'choir-1',
          parentName: 'Chamber Choir',
          groups: [
            group('choir-1', 'Chamber Choir', GroupKind.CHOIR),
            group('section-1', 'Altos', GroupKind.SECTION, 'choir-1'),
          ],
          users: [
            {
              user: member('member-2') as never,
              label: 'Grace Hopper',
              detail: 'grace@example.com',
            },
          ],
          currentMemberships: [membership('membership-1', 'member-1', 'Ada Lovelace', 'ada@example.com', '2025-01-01')],
          scheduledMemberships: [],
          historicalMemberships: [
            membership(
              'membership-2',
              'member-3',
              'Katherine Johnson',
              'katherine@example.com',
              '2024-01-01',
              '2024-12-31',
            ),
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Altos' })).toBeTruthy()
    expect(screen.getAllByText('Section')).toHaveLength(2)
    expect(screen.getByText('Chamber Choir')).toBeTruthy()
    expect(screen.getByText('Lower treble voices')).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Edit Group' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy()

    expect(screen.getByRole('heading', { name: 'Group Memberships' })).toBeTruthy()
    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    expect(screen.queryByLabelText('User')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Add User' }))
    expect(screen.getByLabelText('User')).toBeTruthy()
    expect(screen.queryByRole('dialog', { name: /membership/i })).toBeNull()

    expect(screen.queryByLabelText('End Ada Lovelace membership in Altos')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'End Ada Lovelace membership' }))
    expect(screen.getByLabelText('End Ada Lovelace membership in Altos')).toBeTruthy()

    const history = screen.getByText('History').closest('details')
    expect(history?.hasAttribute('open')).toBe(false)
    expect(screen.getByText('Katherine Johnson')).toBeTruthy()
  })

  test('omits History when the Group has no ended direct memberships', () => {
    render(
      <GroupDetail
        actions={actions}
        group={{
          id: 'choir-1',
          name: 'Chamber Choir',
          kind: GroupKind.CHOIR,
          description: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          parentGroupId: null,
          parentName: null,
          groups: [group('choir-1', 'Chamber Choir', GroupKind.CHOIR)],
          users: [],
          currentMemberships: [],
          scheduledMemberships: [],
          historicalMemberships: [],
        }}
      />,
    )

    expect(screen.queryByText('History')).toBeNull()
    expect(screen.getByText('No current Group Memberships')).toBeTruthy()
    expect(screen.getByText('No description')).toBeTruthy()
    expect(screen.getByText('No parent Group')).toBeTruthy()
  })
})

const actions = {
  updateGroup: async () => ({}),
  createMembership: async () => ({}),
  endMembership: async () => ({}),
}

function group(id: string, name: string, kind: GroupKind, parentGroupId: string | null = null) {
  return {
    id,
    name,
    kind,
    parentGroupId,
    description: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
}

function member(id: string) {
  return {
    id,
    name: id,
    email: `${id}@example.invalid`,
    emailVerified: false,
    status: MemberStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
}

function membership(
  id: string,
  userId: string,
  userLabel: string,
  userDetail: string,
  startsAt: string,
  endsAt?: string,
) {
  return {
    id,
    groupId: 'section-1',
    userId,
    userLabel,
    userDetail,
    startsAt: new Date(startsAt),
    endsAt: endsAt ? new Date(endsAt) : null,
  }
}

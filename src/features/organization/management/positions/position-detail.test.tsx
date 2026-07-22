import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

mock.module('./position-editors', () => ({
  PositionFieldEditor: () => <button type="button">Edit Position</button>,
}))
mock.module('@/features/organization/management/position-assignments/assignment-form', () => ({
  AssignPositionHolderControl: () => <button type="button">Assign holder</button>,
  AssignMemberPositionControl: () => <button type="button">Assign Position</button>,
  EndPositionAssignmentForm: ({ assignment }: { assignment: { memberLabel: string } }) => (
    <input aria-label={`End ${assignment.memberLabel} assignment to this Position`} />
  ),
}))
const { cleanup, render, screen } = await import('@testing-library/react')
const { PositionDetail } = await import('./position-detail')
beforeEach(cleanup)

const group = {
  id: 'group-1',
  name: 'Choir Board',
  description: null,
  kind: GroupKind.BOARD,
  parentGroupId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
const position = {
  id: 'position-1',
  name: 'Chair',
  description: 'Leads the board.',
  createdAt: new Date(),
  updatedAt: new Date(),
}
const member = {
  member: { id: 'member-1', status: MemberStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date() },
  label: 'Ada Lovelace',
  detail: 'ada@example.com',
}
describe('Position detail', () => {
  test('is read-first and manages the current holder inline with collapsed history', () => {
    render(
      <PositionDetail
        position={{
          position,
          groups: [group],
          scopeGroups: [group],
          scopeLabel: 'Choir Board',
          members: [member],
          currentAssignments: [
            {
              id: 'assignment-1',
              positionId: position.id,
              memberId: member.member.id,
              startsAt: new Date('2025-01-15'),
              endsAt: null,
              createdAt: new Date(),
              memberLabel: member.label,
              memberDetail: member.detail,
            },
          ],
          historicalAssignments: [
            {
              id: 'assignment-2',
              positionId: position.id,
              memberId: member.member.id,
              startsAt: new Date('2024-01-01'),
              endsAt: new Date('2024-12-31'),
              createdAt: new Date(),
              memberLabel: member.label,
              memberDetail: member.detail,
            },
          ],
        }}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Chair' })).toBeTruthy()
    expect(screen.getByText('Leads the board.')).toBeTruthy()
    expect(screen.getByText('Choir Board')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit Position' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Assign holder' })).toBeTruthy()
    expect(screen.getByLabelText('End Ada Lovelace assignment to this Position')).toBeTruthy()
    const history = screen.getByText('History').closest('details')
    expect(history?.hasAttribute('open')).toBe(false)
    expect(screen.getByText('Ended Position Assignments')).toBeTruthy()
  })
  test('shows a vacant Position and omits empty history', () => {
    render(
      <PositionDetail
        position={{
          position,
          groups: [group],
          scopeGroups: [group],
          scopeLabel: 'Choir Board',
          members: [member],
          currentAssignments: [],
          historicalAssignments: [],
        }}
      />,
    )
    expect(screen.getByText('Vacant Position')).toBeTruthy()
    expect(screen.queryByText('History')).toBeNull()
  })
})

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { PositionAssignmentManagementScreen } from '@/admin/position-assignment-management/screen'
import type { PositionAssignmentManagementState } from '@/admin/position-assignment-management/service'
import type { OrganizationRecord } from '@/organization'
import { MemberStatus } from '@/prisma/generated/client'

describe('admin Position Assignment management screen', () => {
  test('renders current and historical Position Assignments by Position and by Member', () => {
    const position = positionRecord({ id: 'position-1', name: 'Chair' })
    const member = memberRecord({ id: 'member-1', status: MemberStatus.ACTIVE })
    const historicalMember = memberRecord({ id: 'member-2', status: MemberStatus.FORMER })
    const currentAssignment = assignment({
      id: 'assignment-1',
      positionId: position.id,
      memberId: member.id,
      position,
      member,
      startsAt: date('2026-01-01'),
    })
    const historicalAssignment = assignment({
      id: 'assignment-2',
      positionId: position.id,
      memberId: historicalMember.id,
      position,
      member: historicalMember,
      startsAt: date('2025-01-01'),
      endsAt: date('2025-06-01'),
    })
    const state: PositionAssignmentManagementState = {
      positions: [{ position, label: 'Chair (CSK / Board)', scopeLabel: 'CSK / Board' }],
      members: [
        { member, label: 'Ada Lovelace', detail: 'ada@example.com' },
        { member: historicalMember, label: 'Grace Hopper', detail: 'grace@example.com' },
      ],
      positionViews: [
        {
          position,
          positionLabel: 'Chair (CSK / Board)',
          positionScopeLabel: 'CSK / Board',
          currentAssignments: [currentAssignment],
          historicalAssignments: [historicalAssignment],
        },
      ],
      memberViews: [
        {
          member,
          memberLabel: 'Ada Lovelace',
          memberDetail: 'ada@example.com',
          currentAssignments: [currentAssignment],
          historicalAssignments: [],
        },
        {
          member: historicalMember,
          memberLabel: 'Grace Hopper',
          memberDetail: 'grace@example.com',
          currentAssignments: [],
          historicalAssignments: [historicalAssignment],
        },
      ],
    }

    const markup = renderToStaticMarkup(<PositionAssignmentManagementScreen state={state} />)

    expect(markup).toContain('Assign Position')
    expect(markup).toContain('Current Holder')
    expect(markup).toContain('Historical Holders')
    expect(markup).toContain('Current Positions')
    expect(markup).toContain('Historical Positions')
    expect(markup).toContain('Ada Lovelace')
    expect(markup).toContain('ada@example.com')
    expect(markup).toContain('Chair (CSK / Board)')
    expect(markup).not.toContain('appointment source')
    expect(markup).not.toContain('handover')
  })
})

function positionRecord(
  input: Pick<OrganizationRecord<'position'>, 'id' | 'name'> &
    Partial<Pick<OrganizationRecord<'position'>, 'description'>>,
): OrganizationRecord<'position'> {
  const now = date('2026-01-01')
  return {
    id: input.id,
    name: input.name,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

function memberRecord(input: Pick<OrganizationRecord<'member'>, 'id' | 'status'>): OrganizationRecord<'member'> {
  const now = date('2026-01-01')
  return {
    id: input.id,
    userId: `user-${input.id}`,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  }
}

function assignment(
  input: Pick<OrganizationRecord<'positionAssignment'>, 'id' | 'positionId' | 'memberId' | 'startsAt'> &
    Partial<Pick<OrganizationRecord<'positionAssignment'>, 'endsAt'>> & {
      position: OrganizationRecord<'position'>
      member: OrganizationRecord<'member'>
      positionLabel?: string
      positionScopeLabel?: string
      memberLabel?: string
      memberDetail?: string
    },
) {
  return {
    id: input.id,
    positionId: input.positionId,
    memberId: input.memberId,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    createdAt: date('2026-01-01'),
    position: input.position,
    member: input.member,
    positionLabel: input.positionLabel ?? 'Chair (CSK / Board)',
    positionScopeLabel: input.positionScopeLabel ?? 'CSK / Board',
    memberLabel: input.memberLabel ?? (input.member.id === 'member-1' ? 'Ada Lovelace' : 'Grace Hopper'),
    memberDetail: input.memberDetail ?? (input.member.id === 'member-1' ? 'ada@example.com' : 'grace@example.com'),
  }
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

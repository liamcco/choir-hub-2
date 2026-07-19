import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { GroupMembershipManagementScreen } from '@/admin/group-membership-management/screen'
import type { GroupMembershipManagementState } from '@/admin/group-membership-management/service'
import type { OrganizationRecord } from '@/organization'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

describe('admin Group Membership management screen', () => {
  test('renders current and historical Group Memberships by Group and by Member', () => {
    const choir = group({ id: 'choir-1', kind: GroupKind.CHOIR, name: 'CSK' })
    const altos = group({ id: 'section-1', kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })
    const member = memberRecord({ id: 'member-1', status: MemberStatus.ACTIVE })
    const historicalMember = memberRecord({ id: 'member-2', status: MemberStatus.FORMER })
    const currentMembership = membership({
      id: 'membership-1',
      groupId: altos.id,
      memberId: member.id,
      group: altos,
      member,
      startsAt: date('2026-01-01'),
    })
    const historicalMembership = membership({
      id: 'membership-2',
      groupId: altos.id,
      memberId: historicalMember.id,
      group: altos,
      member: historicalMember,
      startsAt: date('2025-01-01'),
      endsAt: date('2025-06-01'),
    })
    const state: GroupMembershipManagementState = {
      groups: [choir, altos],
      members: [
        { member, label: 'Ada Lovelace', detail: 'ada@example.com' },
        { member: historicalMember, label: 'Grace Hopper', detail: 'grace@example.com' },
      ],
      groupViews: [
        {
          group: altos,
          currentMemberships: [currentMembership],
          scheduledMemberships: [],
          historicalMemberships: [historicalMembership],
        },
      ],
      memberViews: [
        {
          member,
          memberLabel: 'Ada Lovelace',
          memberDetail: 'ada@example.com',
          currentMemberships: [currentMembership],
          scheduledMemberships: [],
          historicalMemberships: [],
        },
        {
          member: historicalMember,
          memberLabel: 'Grace Hopper',
          memberDetail: 'grace@example.com',
          currentMemberships: [],
          scheduledMemberships: [],
          historicalMemberships: [historicalMembership],
        },
      ],
    }

    const markup = renderToStaticMarkup(<GroupMembershipManagementScreen state={state} />)

    expect(markup).toContain('Add Member to Group')
    expect(markup).toContain('Current Members')
    expect(markup).toContain('Scheduled Members')
    expect(markup).toContain('Historical Members')
    expect(markup).toContain('Current Groups')
    expect(markup).toContain('Scheduled Groups')
    expect(markup).toContain('Historical Groups')
    expect(markup).toContain('Ada Lovelace')
    expect(markup).toContain('ada@example.com')
    expect(markup).toContain('CSK / Altos')
    expect(markup).not.toContain('Membership Status')
    expect(markup).not.toContain('Active')
  })
})

function group(
  input: Pick<OrganizationRecord<'group'>, 'id' | 'kind' | 'name'> &
    Partial<Pick<OrganizationRecord<'group'>, 'description' | 'parentGroupId'>>,
): OrganizationRecord<'group'> {
  const now = date('2026-01-01')
  return {
    id: input.id,
    kind: input.kind,
    name: input.name,
    description: input.description ?? null,
    parentGroupId: input.parentGroupId ?? null,
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

function membership(
  input: Pick<OrganizationRecord<'groupMembership'>, 'id' | 'groupId' | 'memberId' | 'startsAt'> &
    Partial<Pick<OrganizationRecord<'groupMembership'>, 'endsAt'>> & {
      group: OrganizationRecord<'group'>
      member: OrganizationRecord<'member'>
      memberLabel?: string
      memberDetail?: string
    },
) {
  return {
    id: input.id,
    groupId: input.groupId,
    memberId: input.memberId,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    group: input.group,
    member: input.member,
    memberLabel: input.memberLabel ?? (input.member.id === 'member-1' ? 'Ada Lovelace' : 'Grace Hopper'),
    memberDetail: input.memberDetail ?? (input.member.id === 'member-1' ? 'ada@example.com' : 'grace@example.com'),
  }
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

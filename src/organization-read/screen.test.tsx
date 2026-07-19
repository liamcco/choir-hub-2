import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { OrganizationalReadOnlyScreen } from '@/organization-read/screen'
import type { OrganizationalReadOnlyState } from '@/organization-read/service'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

describe('organizational read-only screen', () => {
  test('renders organizational data without write controls', () => {
    const state: OrganizationalReadOnlyState = {
      groups: [
        group({ id: 'group-1', name: 'CSK', kind: GroupKind.CHOIR }),
        group({ id: 'group-2', name: 'Altos', kind: GroupKind.SECTION, parentGroupId: 'group-1' }),
      ],
      groupHierarchy: [
        {
          group: group({ id: 'group-1', name: 'CSK', kind: GroupKind.CHOIR }),
          depth: 0,
          children: [
            {
              group: group({ id: 'group-2', name: 'Altos', kind: GroupKind.SECTION, parentGroupId: 'group-1' }),
              depth: 1,
              children: [],
            },
          ],
        },
      ],
      memberViews: [
        {
          member: member({ id: 'member-1', userId: 'auth-user-1', status: MemberStatus.ACTIVE }),
          memberLabel: 'Ada Lovelace',
          memberDetail: 'ada@example.com',
          currentMemberships: [
            membershipPeriod({
              id: 'membership-1',
              memberId: 'member-1',
              groupId: 'group-2',
              groupPath: 'CSK / Altos',
              startsAt: date('2026-01-01'),
            }),
          ],
          historicalMemberships: [
            membershipPeriod({
              id: 'membership-2',
              memberId: 'member-1',
              groupId: 'group-1',
              groupPath: 'CSK',
              startsAt: date('2025-01-01'),
              endsAt: date('2025-06-01'),
            }),
          ],
          currentAssignments: [
            assignmentPeriod({
              id: 'assignment-1',
              memberId: 'member-1',
              positionId: 'position-1',
              positionLabel: 'Chair',
              positionScopeLabel: 'CSK / Altos',
              startsAt: date('2026-01-01'),
            }),
          ],
          historicalAssignments: [
            assignmentPeriod({
              id: 'assignment-2',
              memberId: 'member-1',
              positionId: 'position-2',
              positionLabel: 'Treasurer',
              positionScopeLabel: 'CSK',
              startsAt: date('2025-01-01'),
              endsAt: date('2025-06-01'),
            }),
          ],
        },
      ],
      positionViews: [
        {
          position: position({ id: 'position-1', name: 'Chair', description: 'Leads rehearsals' }),
          scopes: [
            {
              positionId: 'position-1',
              groupId: 'group-2',
              createdAt: date('2026-01-01'),
              group: group({ id: 'group-2', name: 'Altos', kind: GroupKind.SECTION, parentGroupId: 'group-1' }),
              groupPath: 'CSK / Altos',
            },
          ],
          scopeLabel: 'CSK / Altos',
          currentAssignments: [
            assignmentPeriod({
              id: 'assignment-1',
              memberId: 'member-1',
              positionId: 'position-1',
              memberLabel: 'Ada Lovelace',
              memberDetail: 'ada@example.com',
              positionLabel: 'Chair',
              positionScopeLabel: 'CSK / Altos',
              startsAt: date('2026-01-01'),
            }),
          ],
          historicalAssignments: [],
        },
      ],
    }

    const markup = renderToStaticMarkup(<OrganizationalReadOnlyScreen state={state} />)

    expect(markup).toContain('Organization')
    expect(markup).toContain('CSK / Altos')
    expect(markup).toContain('Ada Lovelace')
    expect(markup).toContain('Historical Group Memberships')
    expect(markup).toContain('Position Scopes')
    expect(markup).toContain('Section')
    expect(markup).toContain('Current Holder')
    expect(markup).toContain('Treasurer')
    expect(markup).not.toContain('Create')
    expect(markup).not.toContain('Edit')
    expect(markup).not.toContain('Delete')
    expect(markup).not.toContain('Assign Position')
    expect(markup).not.toContain('<form')
    expect(markup).not.toContain('<button')
  })
})

function group(
  input: Pick<OrganizationalReadOnlyState['groups'][number], 'id' | 'kind' | 'name'> &
    Partial<Pick<OrganizationalReadOnlyState['groups'][number], 'description' | 'parentGroupId'>>,
): OrganizationalReadOnlyState['groups'][number] {
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

function member(
  input: Pick<OrganizationalReadOnlyState['memberViews'][number]['member'], 'id' | 'userId' | 'status'>,
): OrganizationalReadOnlyState['memberViews'][number]['member'] {
  const now = date('2026-01-01')
  return {
    ...input,
    createdAt: now,
    updatedAt: now,
  }
}

function position(
  input: Pick<OrganizationalReadOnlyState['positionViews'][number]['position'], 'id' | 'name'> &
    Partial<Pick<OrganizationalReadOnlyState['positionViews'][number]['position'], 'description'>>,
): OrganizationalReadOnlyState['positionViews'][number]['position'] {
  const now = date('2026-01-01')
  return {
    id: input.id,
    name: input.name,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

function membershipPeriod(
  input: Omit<OrganizationalReadOnlyState['memberViews'][number]['currentMemberships'][number], 'group' | 'endsAt'> & {
    groupId: string
    endsAt?: Date | null
  },
): OrganizationalReadOnlyState['memberViews'][number]['currentMemberships'][number] {
  return {
    ...input,
    group: group({ id: input.groupId, name: input.groupPath, kind: GroupKind.CHOIR }),
    endsAt: input.endsAt ?? null,
  }
}

function assignmentPeriod(
  input: Omit<
    OrganizationalReadOnlyState['memberViews'][number]['currentAssignments'][number],
    'createdAt' | 'endsAt' | 'member' | 'memberDetail' | 'memberLabel' | 'position'
  > &
    Partial<
      Pick<
        OrganizationalReadOnlyState['memberViews'][number]['currentAssignments'][number],
        'endsAt' | 'memberDetail' | 'memberLabel'
      >
    >,
): OrganizationalReadOnlyState['memberViews'][number]['currentAssignments'][number] {
  return {
    ...input,
    createdAt: date('2026-01-01'),
    member: member({ id: input.memberId, userId: 'auth-user-1', status: MemberStatus.ACTIVE }),
    memberLabel: input.memberLabel ?? 'Ada Lovelace',
    memberDetail: input.memberDetail ?? 'ada@example.com',
    position: position({ id: input.positionId, name: input.positionLabel }),
    endsAt: input.endsAt ?? null,
  }
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

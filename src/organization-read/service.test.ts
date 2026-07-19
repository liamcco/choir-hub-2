import { beforeEach, describe, expect, test } from 'bun:test'
import {
  createGroupMembershipHistory,
  createGroupStructure,
  createMemberRegistry,
  createPositionAssignmentHistory,
  createPositionScopeRegistry,
} from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import {
  createOrganizationalReadOnlyService,
  OrganizationalReadOnlyAuthorizationError,
} from '@/organization-read/service'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('organizational read-only service', () => {
  test('lets non-admin Users read Groups, Members, memberships, Positions, scopes, and holders', async () => {
    const service = createService({
      users: [
        { id: 'auth-user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
        { id: 'auth-user-2', name: 'Grace Hopper', email: 'grace@example.com' },
      ],
    })
    const actor = { id: 'regular-user', role: 'user' }
    const org = organization()
    const choir = await org.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const altos = await org.createGroup({ kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })
    const ada = await org.createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })
    const grace = await org.createMember({ userId: 'auth-user-2', status: MemberStatus.PASSIVE })
    const historicalMembership = await org.createGroupMembership({
      memberId: ada.id,
      groupId: altos.id,
      startsAt: date('2025-01-01'),
      endsAt: date('2025-06-01'),
    })
    const currentMembership = await org.createGroupMembership({
      memberId: grace.id,
      groupId: altos.id,
      startsAt: date('2026-01-01'),
    })
    const chair = await org.createPosition({ name: 'Chair', description: 'Leads rehearsals' })
    const chairScope = await org.createPositionScope({ positionId: chair.id, groupId: altos.id })
    const historicalAssignment = await org.createPositionAssignment({
      positionId: chair.id,
      memberId: ada.id,
      startsAt: date('2025-01-01'),
      endsAt: date('2025-06-01'),
    })
    const currentAssignment = await org.createPositionAssignment({
      positionId: chair.id,
      memberId: grace.id,
      startsAt: date('2026-01-01'),
    })

    const state = await service.listOrganizationalReadOnly(actor, { at: date('2026-07-01') })

    expect(state.groupHierarchy).toMatchObject([
      {
        group: { id: choir.id, name: 'CSK' },
        children: [{ group: { id: altos.id, name: 'Altos' } }],
      },
    ])
    expect(state.memberViews).toMatchObject([
      {
        member: { id: ada.id },
        memberLabel: 'Ada Lovelace',
        memberDetail: 'ada@example.com',
        currentMemberships: [],
        historicalMemberships: [{ id: historicalMembership.id, groupPath: 'CSK / Altos' }],
        historicalAssignments: [{ id: historicalAssignment.id, positionLabel: 'Chair' }],
      },
      {
        member: { id: grace.id },
        memberLabel: 'Grace Hopper',
        memberDetail: 'grace@example.com',
        currentMemberships: [{ id: currentMembership.id, groupPath: 'CSK / Altos' }],
        currentAssignments: [{ id: currentAssignment.id, positionLabel: 'Chair' }],
      },
    ])
    expect(state.positionViews).toMatchObject([
      {
        position: { id: chair.id, name: 'Chair' },
        scopes: [{ positionId: chairScope.positionId, groupId: chairScope.groupId, groupPath: 'CSK / Altos' }],
        scopeLabel: 'CSK / Altos',
        currentAssignments: [{ memberLabel: 'Grace Hopper' }],
        historicalAssignments: [{ memberLabel: 'Ada Lovelace' }],
      },
    ])
  })

  test('requires an authenticated actor but does not require admin role', async () => {
    const service = createService()

    await expect(service.listOrganizationalReadOnly(null)).rejects.toBeInstanceOf(
      OrganizationalReadOnlyAuthorizationError,
    )
    await expect(service.listOrganizationalReadOnly({ id: 'regular-user', role: 'user' })).resolves.toMatchObject({
      groups: [],
      memberViews: [],
      positionViews: [],
    })
  })
})

function createService(input: { users?: { id: string; name: string; email: string }[] } = {}) {
  return createOrganizationalReadOnlyService({
    authGateway: {
      listUsers: async () =>
        (input.users ?? []).map((user) => ({
          ...user,
          createdAt: date('2026-01-01'),
        })),
    },
    groupMembershipHistory: createGroupMembershipHistory(persistence),
    groupStructure: createGroupStructure(persistence),
    memberRegistry: createMemberRegistry(persistence),
    positionAssignmentHistory: createPositionAssignmentHistory(persistence),
    positionScopeRegistry: createPositionScopeRegistry(persistence),
  })
}

function organization() {
  return {
    ...createGroupStructure(persistence),
    ...createMemberRegistry(persistence),
    ...createGroupMembershipHistory(persistence),
    ...createPositionScopeRegistry(persistence),
    ...createPositionAssignmentHistory(persistence),
  }
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

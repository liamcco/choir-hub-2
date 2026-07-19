import { beforeEach, describe, expect, test } from 'bun:test'
import {
  createPositionAssignmentManagementService,
  PositionAssignmentManagementAuthorizationError,
} from '@/admin/position-assignment-management/service'
import {
  createGroupStructure,
  createMemberRegistry,
  createPositionAssignmentHistory,
  createPositionScopeRegistry,
} from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('admin Position Assignment management service', () => {
  test('assigns and ends Positions while exposing current and historical Position and Member views', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const choir = await organization().createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const board = await organization().createGroup({ kind: GroupKind.BOARD, name: 'Board', parentGroupId: choir.id })
    const chair = await organization().createPosition({ name: 'Chair', description: null })
    await organization().createPositionScope({ positionId: chair.id, groupId: board.id })
    const firstMember = await organization().createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })
    const secondMember = await organization().createMember({ userId: 'auth-user-2', status: MemberStatus.ACTIVE })
    const historical = await service.createPositionAssignment(actor, {
      memberId: firstMember.id,
      positionId: chair.id,
      startsAt: date('2025-01-01'),
    })
    await service.endPositionAssignment(actor, historical.id, { endsAt: date('2025-06-01') })
    const current = await service.createPositionAssignment(actor, {
      memberId: secondMember.id,
      positionId: chair.id,
      startsAt: date('2026-01-01'),
    })

    const state = await service.listPositionAssignmentManagement(actor, { at: date('2026-07-01') })
    const chairView = state.positionViews.find((view) => view.position.id === chair.id)
    const firstMemberView = state.memberViews.find((view) => view.member.id === firstMember.id)
    const secondMemberView = state.memberViews.find((view) => view.member.id === secondMember.id)

    expect(chairView).toMatchObject({
      positionLabel: 'Chair (CSK / Board)',
      currentAssignments: [{ id: current.id, memberId: secondMember.id }],
      historicalAssignments: [{ id: historical.id, memberId: firstMember.id }],
    })
    expect(firstMemberView?.historicalAssignments).toMatchObject([{ positionId: chair.id }])
    expect(secondMemberView?.currentAssignments).toMatchObject([{ positionId: chair.id }])
  })

  test('labels Members with linked auth account identity', async () => {
    const service = createService({
      users: [{ id: 'auth-user-1', name: 'Ada Lovelace', email: 'ada@example.com' }],
    })
    const actor = { id: 'admin-user', role: 'admin' }
    const position = await organization().createPosition({ name: 'Librarian', description: null })
    const member = await organization().createMember({ userId: 'auth-user-1' })
    await service.createPositionAssignment(actor, {
      memberId: member.id,
      positionId: position.id,
      startsAt: date('2026-01-01'),
    })

    const state = await service.listPositionAssignmentManagement(actor, { at: date('2026-07-01') })

    expect(state.members).toMatchObject([{ label: 'Ada Lovelace', detail: 'ada@example.com' }])
    expect(state.memberViews[0]).toMatchObject({
      memberLabel: 'Ada Lovelace',
      memberDetail: 'ada@example.com',
      currentAssignments: [{ memberLabel: 'Ada Lovelace', memberDetail: 'ada@example.com' }],
      historicalAssignments: [],
    })
  })

  test('rejects overlapping periods for the same Position with field feedback', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const position = await organization().createPosition({ name: 'Chair', description: null })
    const firstMember = await organization().createMember({ userId: 'auth-user-1' })
    const secondMember = await organization().createMember({ userId: 'auth-user-2' })
    await service.createPositionAssignment(actor, {
      memberId: firstMember.id,
      positionId: position.id,
      startsAt: date('2026-01-01'),
    })

    await expect(
      service.createPositionAssignment(actor, {
        memberId: secondMember.id,
        positionId: position.id,
        startsAt: date('2026-02-01'),
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        startsAt: 'This Position already has an assignment during that period.',
      },
    })
  })

  test('rejects non-admin reads and writes', async () => {
    const service = createService()
    const actor = { id: 'regular-user', role: 'user' }

    await expect(service.listPositionAssignmentManagement(actor)).rejects.toBeInstanceOf(
      PositionAssignmentManagementAuthorizationError,
    )
    await expect(
      service.createPositionAssignment(actor, {
        memberId: 'member-1',
        positionId: 'position-1',
        startsAt: date('2026-01-01'),
      }),
    ).rejects.toBeInstanceOf(PositionAssignmentManagementAuthorizationError)
  })
})

function createService(input: { users?: { id: string; name: string; email: string }[] } = {}) {
  return createPositionAssignmentManagementService({
    authGateway: {
      listUsers: async () =>
        (input.users ?? []).map((user) => ({
          ...user,
          createdAt: date('2026-01-01'),
        })),
    },
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
    ...createPositionAssignmentHistory(persistence),
    ...createPositionScopeRegistry(persistence),
  }
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

import { beforeEach, describe, expect, test } from 'bun:test'
import {
  createGroupMembershipManagementService,
  GroupMembershipManagementAuthorizationError,
} from '@/admin/group-membership-management/service'
import { createOrganizationDomain } from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('admin Group Membership management service', () => {
  test('adds and ends Group Memberships while exposing current and historical Group and Member views', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const choir = await organization().createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const altos = await organization().createGroup({ kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })
    const firstMember = await organization().createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })
    const secondMember = await organization().createMember({ userId: 'auth-user-2', status: MemberStatus.PASSIVE })
    const historical = await service.createGroupMembership(actor, {
      memberId: firstMember.id,
      groupId: altos.id,
      startsAt: date('2025-01-01'),
    })
    await service.endGroupMembership(actor, historical.id, { endsAt: date('2025-06-01') })
    const current = await service.createGroupMembership(actor, {
      memberId: secondMember.id,
      groupId: altos.id,
      startsAt: date('2026-01-01'),
    })

    const state = await service.listGroupMembershipManagement(actor, { at: date('2026-07-01') })
    const altosView = state.groupViews.find((view) => view.group.id === altos.id)
    const firstMemberView = state.memberViews.find((view) => view.member.id === firstMember.id)
    const secondMemberView = state.memberViews.find((view) => view.member.id === secondMember.id)

    expect(altosView?.currentMemberships).toMatchObject([{ id: current.id, memberId: secondMember.id }])
    expect(altosView?.historicalMemberships).toMatchObject([{ id: historical.id, memberId: firstMember.id }])
    expect(firstMemberView?.historicalMemberships).toMatchObject([{ groupId: altos.id }])
    expect(secondMemberView?.currentMemberships).toMatchObject([{ groupId: altos.id }])
  })

  test('labels Members with linked auth account identity', async () => {
    const service = createService({
      users: [{ id: 'auth-user-1', name: 'Ada Lovelace', email: 'ada@example.com' }],
    })
    const actor = { id: 'admin-user', role: 'admin' }
    const group = await organization().createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const member = await organization().createMember({ userId: 'auth-user-1' })
    await service.createGroupMembership(actor, {
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-01-01'),
    })

    const state = await service.listGroupMembershipManagement(actor, { at: date('2026-07-01') })

    expect(state.members).toMatchObject([{ label: 'Ada Lovelace', detail: 'ada@example.com' }])
    expect(state.memberViews[0]).toMatchObject({
      memberLabel: 'Ada Lovelace',
      memberDetail: 'ada@example.com',
      currentMemberships: [{ memberLabel: 'Ada Lovelace', memberDetail: 'ada@example.com' }],
      scheduledMemberships: [],
      historicalMemberships: [],
    })
  })

  test('keeps future start dates visible as scheduled memberships', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const group = await organization().createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const member = await organization().createMember({ userId: 'auth-user-1' })
    const membership = await service.createGroupMembership(actor, {
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-09-01'),
    })

    const state = await service.listGroupMembershipManagement(actor, { at: date('2026-07-01') })

    expect(state.groupViews[0]).toMatchObject({
      currentMemberships: [],
      scheduledMemberships: [{ id: membership.id }],
      historicalMemberships: [],
    })
  })

  test('rejects overlapping periods for the same Member and Group with field feedback', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const group = await organization().createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const member = await organization().createMember({ userId: 'auth-user-1' })
    await service.createGroupMembership(actor, {
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-01-01'),
    })

    await expect(
      service.createGroupMembership(actor, {
        memberId: member.id,
        groupId: group.id,
        startsAt: date('2026-02-01'),
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        startsAt: 'This Member already has a Group Membership in this Group during that period.',
      },
    })
  })

  test('rejects non-admin reads and writes', async () => {
    const service = createService()
    const actor = { id: 'regular-user', role: 'user' }

    await expect(service.listGroupMembershipManagement(actor)).rejects.toBeInstanceOf(
      GroupMembershipManagementAuthorizationError,
    )
    await expect(
      service.createGroupMembership(actor, {
        memberId: 'member-1',
        groupId: 'group-1',
        startsAt: date('2026-01-01'),
      }),
    ).rejects.toBeInstanceOf(GroupMembershipManagementAuthorizationError)
  })
})

function createService(input: { users?: { id: string; name: string; email: string }[] } = {}) {
  return createGroupMembershipManagementService({
    authGateway: {
      listUsers: async () =>
        (input.users ?? []).map((user) => ({
          ...user,
          createdAt: date('2026-01-01'),
        })),
    },
    organization: organization(),
  })
}

function organization() {
  return createOrganizationDomain(persistence)
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

import { beforeEach, describe, expect, test } from 'bun:test'
import { createOrganizationDomain } from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind, MemberStatus } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('organization domain interface', () => {
  test('reads and writes Groups, Members, Group Memberships, Positions, Position Scopes, and Position Assignments', async () => {
    const organization = createOrganizationDomain(persistence)

    const choir = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const altos = await organization.createGroup({
      kind: GroupKind.SECTION,
      name: 'Altos',
      parentGroupId: choir.id,
    })
    const member = await organization.createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })
    const membership = await organization.createGroupMembership({
      memberId: member.id,
      groupId: altos.id,
      startsAt: date('2026-01-01'),
    })
    const position = await organization.createPosition({ name: 'Concert Master' })
    const scope = await organization.createPositionScope({ positionId: position.id, groupId: altos.id })
    const assignment = await organization.createPositionAssignment({
      positionId: position.id,
      memberId: member.id,
      startsAt: date('2026-02-01'),
    })

    expect(await organization.listGroups()).toEqual([choir, altos])
    expect(await organization.listMembers()).toEqual([member])
    expect(await organization.listGroupMemberships()).toEqual([membership])
    expect(await organization.listPositions()).toEqual([position])
    expect(await organization.listPositionScopes()).toEqual([scope])
    expect(await organization.listPositionAssignments()).toEqual([assignment])
  })

  test('filters memberships and assignments for current and historical organizational reads', async () => {
    const organization = createOrganizationDomain(persistence)
    const choir = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const board = await organization.createGroup({ kind: GroupKind.BOARD, name: 'Board' })
    const firstMember = await organization.createMember({ userId: 'auth-user-1' })
    const secondMember = await organization.createMember({ userId: 'auth-user-2' })
    const chair = await organization.createPosition({ name: 'Chair' })

    const historicalMembership = await organization.createGroupMembership({
      memberId: firstMember.id,
      groupId: choir.id,
      startsAt: date('2025-01-01'),
      endsAt: date('2026-01-01'),
    })
    const currentMembership = await organization.createGroupMembership({
      memberId: firstMember.id,
      groupId: board.id,
      startsAt: date('2026-01-01'),
    })
    const historicalAssignment = await organization.createPositionAssignment({
      positionId: chair.id,
      memberId: secondMember.id,
      startsAt: date('2025-01-01'),
      endsAt: date('2026-01-01'),
    })
    const currentAssignment = await organization.createPositionAssignment({
      positionId: chair.id,
      memberId: firstMember.id,
      startsAt: date('2026-01-01'),
    })

    expect(await organization.listGroupMemberships({ memberId: firstMember.id, at: date('2025-06-01') })).toEqual([
      historicalMembership,
    ])
    expect(await organization.listGroupMemberships({ groupId: board.id, at: date('2026-06-01') })).toEqual([
      currentMembership,
    ])
    expect(await organization.listPositionAssignments({ positionId: chair.id, at: date('2025-06-01') })).toEqual([
      historicalAssignment,
    ])
    expect(await organization.listPositionAssignments({ memberId: firstMember.id, at: date('2026-06-01') })).toEqual([
      currentAssignment,
    ])
  })

  test('updates editable organizational records and removes Position Scopes through the interface', async () => {
    const organization = createOrganizationDomain(persistence)
    const group = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const member = await organization.createMember({ userId: 'auth-user-1' })
    const membership = await organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-01-01'),
    })
    const position = await organization.createPosition({ name: 'Chair' })
    await organization.createPositionScope({ positionId: position.id, groupId: group.id })
    const assignment = await organization.createPositionAssignment({
      positionId: position.id,
      memberId: member.id,
      startsAt: date('2026-02-01'),
    })

    const updatedGroup = await organization.updateGroup(group.id, {
      description: 'Main choir',
      name: 'CSK Choir',
    })
    const updatedMember = await organization.updateMember(member.id, { status: MemberStatus.PASSIVE })
    const updatedMembership = await organization.updateGroupMembership(membership.id, { endsAt: date('2026-06-01') })
    const updatedPosition = await organization.updatePosition(position.id, { description: 'Board chair' })
    const updatedAssignment = await organization.updatePositionAssignment(assignment.id, { endsAt: date('2026-07-01') })
    await organization.deletePositionScope({ positionId: position.id, groupId: group.id })

    expect(updatedGroup).toMatchObject({ description: 'Main choir', name: 'CSK Choir' })
    expect(updatedMember).toMatchObject({ status: MemberStatus.PASSIVE })
    expect(updatedMembership).toMatchObject({ endsAt: date('2026-06-01') })
    expect(updatedPosition).toMatchObject({ description: 'Board chair' })
    expect(updatedAssignment).toMatchObject({ endsAt: date('2026-07-01') })
    expect(await organization.listPositionScopes()).toEqual([])
  })

  test('validates sibling Group name uniqueness while allowing the same name under a different parent', async () => {
    const organization = createOrganizationDomain(persistence)
    const choir = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const secondChoir = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'External Choir' })

    await organization.createGroup({ kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })
    await organization.createGroup({ kind: GroupKind.SECTION, name: 'Altos', parentGroupId: secondChoir.id })

    await expect(
      organization.createGroup({ kind: GroupKind.SECTION, name: ' altos ', parentGroupId: choir.id }),
    ).rejects.toMatchObject({
      code: 'DUPLICATE_SIBLING_GROUP_NAME',
      field: 'name',
    })
  })

  test('preserves the invariant that Group Membership periods do not overlap for the same Member and Group', async () => {
    const organization = createOrganizationDomain(persistence)
    const group = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const member = await organization.createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })

    await organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-01-01'),
      endsAt: date('2026-03-01'),
    })
    await organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-03-01'),
      endsAt: date('2026-04-01'),
    })

    const overlappingWrite = organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-02-01'),
      endsAt: date('2026-02-15'),
    })

    await expect(overlappingWrite).rejects.toMatchObject({
      code: 'GROUP_MEMBERSHIP_PERIOD_OVERLAP',
      field: 'startsAt',
    })
  })

  test('preserves the invariant that Position Assignment periods do not overlap for the same Position', async () => {
    const organization = createOrganizationDomain(persistence)
    const group = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const firstMember = await organization.createMember({ userId: 'auth-user-1', status: MemberStatus.ACTIVE })
    const secondMember = await organization.createMember({ userId: 'auth-user-2', status: MemberStatus.ACTIVE })
    const position = await organization.createPosition({ name: 'Chair' })

    await organization.createPositionScope({ positionId: position.id, groupId: group.id })
    await organization.createPositionAssignment({
      positionId: position.id,
      memberId: firstMember.id,
      startsAt: date('2026-01-01'),
      endsAt: date('2026-06-01'),
    })

    await expect(
      organization.createPositionAssignment({
        positionId: position.id,
        memberId: secondMember.id,
        startsAt: date('2026-05-01'),
      }),
    ).rejects.toMatchObject({
      code: 'POSITION_ASSIGNMENT_PERIOD_OVERLAP',
      field: 'startsAt',
    })
  })

  test('validates sibling names and dated-period invariants when updating through the interface', async () => {
    const organization = createOrganizationDomain(persistence)
    const group = await organization.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    const firstSibling = await organization.createGroup({
      kind: GroupKind.SECTION,
      name: 'Altos',
      parentGroupId: group.id,
    })
    await organization.createGroup({ kind: GroupKind.SECTION, name: 'Tenors', parentGroupId: group.id })
    const member = await organization.createMember({ userId: 'auth-user-1' })
    const secondMember = await organization.createMember({ userId: 'auth-user-2' })
    const position = await organization.createPosition({ name: 'Chair' })
    const firstMembership = await organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-01-01'),
      endsAt: date('2026-02-01'),
    })
    await organization.createGroupMembership({
      memberId: member.id,
      groupId: group.id,
      startsAt: date('2026-03-01'),
      endsAt: date('2026-04-01'),
    })
    const firstAssignment = await organization.createPositionAssignment({
      positionId: position.id,
      memberId: member.id,
      startsAt: date('2026-01-01'),
      endsAt: date('2026-02-01'),
    })
    await organization.createPositionAssignment({
      positionId: position.id,
      memberId: secondMember.id,
      startsAt: date('2026-03-01'),
      endsAt: date('2026-04-01'),
    })

    await expect(organization.updateGroup(firstSibling.id, { name: 'tenors' })).rejects.toMatchObject({
      code: 'DUPLICATE_SIBLING_GROUP_NAME',
      field: 'name',
    })
    await expect(
      organization.updateGroupMembership(firstMembership.id, { endsAt: date('2026-03-15') }),
    ).rejects.toMatchObject({
      code: 'GROUP_MEMBERSHIP_PERIOD_OVERLAP',
      field: 'startsAt',
    })
    await expect(
      organization.updatePositionAssignment(firstAssignment.id, { endsAt: date('2026-03-15') }),
    ).rejects.toMatchObject({
      code: 'POSITION_ASSIGNMENT_PERIOD_OVERLAP',
      field: 'startsAt',
    })
  })
})

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

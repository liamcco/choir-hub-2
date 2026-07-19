import { beforeEach, describe, expect, test } from 'bun:test'
import {
  createGroupMembershipHistory,
  createGroupStructure,
  createPositionAssignmentHistory,
  createPositionScopeRegistry,
} from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('organization workflow modules', () => {
  test('Group structure preserves flexible hierarchy and sibling-only name uniqueness', async () => {
    const groups = createGroupStructure(persistence)

    const choir = await groups.createGroup({ kind: GroupKind.CHOIR, name: 'CSK' })
    await groups.createGroup({ kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })
    const project = await groups.createGroup({ kind: GroupKind.PROJECT, name: 'Tour' })
    await groups.createGroup({ kind: GroupKind.CHOIR, name: 'Altos', parentGroupId: project.id })

    await expect(
      groups.createGroup({ kind: GroupKind.SECTION, name: ' altos ', parentGroupId: choir.id }),
    ).rejects.toMatchObject({
      code: 'DUPLICATE_SIBLING_GROUP_NAME',
      field: 'name',
    })
    await expect(groups.listGroups()).resolves.toHaveLength(4)
  })

  test('Group Membership history preserves dated membership periods', async () => {
    const memberships = createGroupMembershipHistory(persistence)

    await memberships.createGroupMembership({
      memberId: 'member-1',
      groupId: 'group-1',
      startsAt: date('2026-01-01'),
      endsAt: date('2026-03-01'),
    })
    await memberships.createGroupMembership({
      memberId: 'member-1',
      groupId: 'group-1',
      startsAt: date('2026-03-01'),
    })

    await expect(
      memberships.createGroupMembership({
        memberId: 'member-1',
        groupId: 'group-1',
        startsAt: date('2026-02-01'),
        endsAt: date('2026-02-15'),
      }),
    ).rejects.toMatchObject({
      code: 'GROUP_MEMBERSHIP_PERIOD_OVERLAP',
      field: 'startsAt',
    })
    await expect(memberships.listGroupMemberships({ memberId: 'member-1', at: date('2026-04-01') })).resolves.toEqual([
      expect.objectContaining({ groupId: 'group-1', memberId: 'member-1', endsAt: null }),
    ])
  })

  test('Position Scope allows duplicate Position names and multi-Group scopes', async () => {
    const positions = createPositionScopeRegistry(persistence)

    const chair = await positions.createPosition({ name: 'Chair' })
    const secondChair = await positions.createPosition({ name: 'Chair' })
    const firstScope = await positions.createPositionScope({ positionId: chair.id, groupId: 'group-1' })
    const secondScope = await positions.createPositionScope({ positionId: chair.id, groupId: 'group-2' })

    expect(await positions.listPositions()).toEqual([chair, secondChair])
    expect(await positions.listPositionScopes()).toEqual([firstScope, secondScope])

    await positions.deletePositionScope({ positionId: chair.id, groupId: 'group-1' })
    expect(await positions.listPositionScopes()).toEqual([secondScope])
  })

  test('Position Assignment history preserves one holder at a time per Position', async () => {
    const assignments = createPositionAssignmentHistory(persistence)

    await assignments.createPositionAssignment({
      positionId: 'position-1',
      memberId: 'member-1',
      startsAt: date('2026-01-01'),
      endsAt: date('2026-06-01'),
    })
    await assignments.createPositionAssignment({
      positionId: 'position-1',
      memberId: 'member-2',
      startsAt: date('2026-06-01'),
    })

    await expect(
      assignments.createPositionAssignment({
        positionId: 'position-1',
        memberId: 'member-3',
        startsAt: date('2026-05-01'),
      }),
    ).rejects.toMatchObject({
      code: 'POSITION_ASSIGNMENT_PERIOD_OVERLAP',
      field: 'startsAt',
    })
    await expect(
      assignments.listPositionAssignments({ positionId: 'position-1', at: date('2026-07-01') }),
    ).resolves.toEqual([expect.objectContaining({ memberId: 'member-2', positionId: 'position-1', endsAt: null })])
  })
})

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

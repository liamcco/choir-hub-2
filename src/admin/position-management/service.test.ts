import { beforeEach, describe, expect, test } from 'bun:test'
import {
  createPositionManagementService,
  PositionManagementAuthorizationError,
  PositionManagementValidationError,
} from '@/admin/position-management/service'
import { createGroupStructure, createPositionScopeRegistry } from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('admin Position management service', () => {
  test('creates same-named Positions and distinguishes shared multi-scope Positions', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const choir = await createGroup('CSK', GroupKind.CHOIR)
    const board = await createGroup('Board', GroupKind.BOARD, choir.id)
    const concertGroup = await createGroup('Concert Group', GroupKind.PROJECT, choir.id)

    const sharedChair = await service.createPosition(actor, {
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: [board.id, concertGroup.id],
    })
    const choirChair = await service.createPosition(actor, {
      name: 'Chair',
      description: 'Separate choir position',
      groupIds: [choir.id],
    })

    await expect(service.listPositionManagement(actor)).resolves.toMatchObject({
      groups: [choir, board, concertGroup],
      positions: [
        {
          position: sharedChair,
          duplicateNameCount: 2,
          scopeGroups: [board, concertGroup],
          scopeLabel: 'CSK / Board + CSK / Concert Group',
          scopeKind: 'shared',
        },
        {
          position: choirChair,
          duplicateNameCount: 2,
          scopeGroups: [choir],
          scopeLabel: 'CSK',
          scopeKind: 'single',
        },
      ],
    })
  })

  test('edits Position fields and removes a scope without deleting the Position', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const board = await createGroup('Board', GroupKind.BOARD)
    const concertGroup = await createGroup('Concert Group', GroupKind.PROJECT)
    const position = await service.createPosition(actor, {
      name: 'Treasurer',
      description: null,
      groupIds: [board.id, concertGroup.id],
    })

    const updated = await service.updatePosition(actor, position.id, {
      name: 'Finance Lead',
      description: 'Budget responsibility',
      groupIds: [concertGroup.id],
    })

    expect(updated).toMatchObject({
      id: position.id,
      name: 'Finance Lead',
      description: 'Budget responsibility',
    })
    expect('groupIds' in updated).toBe(false)
    await expect(service.listPositionManagement(actor)).resolves.toMatchObject({
      positions: [
        {
          position: updated,
          scopeGroups: [concertGroup],
        },
      ],
    })
  })

  test('rejects Positions without at least one Group scope', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }

    await expect(service.createPosition(actor, { name: 'Chair', groupIds: [] })).rejects.toMatchObject({
      fieldErrors: {
        groupIds: 'Choose at least one Group.',
      },
    })
  })

  test('rejects non-admin reads and writes', async () => {
    const service = createService()
    const actor = { id: 'regular-user', role: 'user' }

    await expect(service.listPositionManagement(actor)).rejects.toBeInstanceOf(PositionManagementAuthorizationError)
    await expect(service.createPosition(actor, { name: 'Denied', groupIds: ['group-1'] })).rejects.toBeInstanceOf(
      PositionManagementAuthorizationError,
    )
  })

  test('exports the validation error type for action mapping', () => {
    expect(new PositionManagementValidationError('Invalid', { name: 'Invalid' }).fieldErrors).toEqual({
      name: 'Invalid',
    })
  })
})

function createService() {
  return createPositionManagementService({
    groupStructure: createGroupStructure(persistence),
    positionScopeRegistry: createPositionScopeRegistry(persistence),
  })
}

async function createGroup(name: string, kind: GroupKind, parentGroupId: string | null = null) {
  const groups = createGroupStructure(persistence)
  return groups.createGroup({ kind, name, parentGroupId })
}

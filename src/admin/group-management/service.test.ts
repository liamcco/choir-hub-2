import { beforeEach, describe, expect, test } from 'bun:test'
import { createGroupManagementService, GroupManagementAuthorizationError } from '@/admin/group-management/service'
import { createGroupStructure } from '@/organization'
import { InMemoryOrganizationPersistence } from '@/organization/test-support'
import { GroupKind } from '@/prisma/generated/client'

let persistence: InMemoryOrganizationPersistence

beforeEach(() => {
  persistence = new InMemoryOrganizationPersistence()
})

describe('admin Group management service', () => {
  test('creates and edits Groups while exposing the organizational hierarchy', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }

    const choir = await service.createGroup(actor, {
      kind: GroupKind.CHOIR,
      name: ' CSK ',
      description: 'Main choir',
      parentGroupId: null,
    })
    const altos = await service.createGroup(actor, {
      kind: GroupKind.SECTION,
      name: 'Altos',
      description: null,
      parentGroupId: choir.id,
    })

    const updatedAltos = await service.updateGroup(actor, altos.id, {
      kind: GroupKind.PROJECT,
      name: 'Alto project',
      description: 'Flexible v1 hierarchy',
      parentGroupId: choir.id,
    })

    expect(updatedAltos).toMatchObject({
      kind: GroupKind.PROJECT,
      name: 'Alto project',
      description: 'Flexible v1 hierarchy',
      parentGroupId: choir.id,
    })
    await expect(service.listGroupManagement(actor)).resolves.toMatchObject({
      groups: [choir, updatedAltos],
      hierarchy: [
        {
          group: choir,
          depth: 0,
          children: [
            {
              group: updatedAltos,
              depth: 1,
              children: [],
            },
          ],
        },
      ],
    })
  })

  test('rejects duplicate sibling names with a useful field error', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const choir = await service.createGroup(actor, { kind: GroupKind.CHOIR, name: 'CSK', parentGroupId: null })
    await service.createGroup(actor, { kind: GroupKind.SECTION, name: 'Altos', parentGroupId: choir.id })

    await expect(
      service.createGroup(actor, { kind: GroupKind.SECTION, name: ' altos ', parentGroupId: choir.id }),
    ).rejects.toMatchObject({
      fieldErrors: {
        name: 'A sibling Group named "altos" already exists.',
      },
    })
  })

  test('does not enforce kind-based parent and child rules', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const project = await service.createGroup(actor, { kind: GroupKind.PROJECT, name: 'Tour', parentGroupId: null })

    await expect(
      service.createGroup(actor, {
        kind: GroupKind.CHOIR,
        name: 'Temporary Choir',
        parentGroupId: project.id,
      }),
    ).resolves.toMatchObject({
      kind: GroupKind.CHOIR,
      parentGroupId: project.id,
    })
  })

  test('rejects moving a Group under one of its descendants', async () => {
    const service = createService()
    const actor = { id: 'admin-user', role: 'admin' }
    const choir = await service.createGroup(actor, { kind: GroupKind.CHOIR, name: 'CSK', parentGroupId: null })
    const section = await service.createGroup(actor, {
      kind: GroupKind.SECTION,
      name: 'Altos',
      parentGroupId: choir.id,
    })

    await expect(service.updateGroup(actor, choir.id, { parentGroupId: section.id })).rejects.toMatchObject({
      fieldErrors: {
        parentGroupId: 'A Group cannot be moved under one of its child Groups.',
      },
    })
  })

  test('rejects non-admin reads and writes', async () => {
    const service = createService()
    const actor = { id: 'regular-user', role: 'user' }

    await expect(service.listGroupManagement(actor)).rejects.toBeInstanceOf(GroupManagementAuthorizationError)
    await expect(
      service.createGroup(actor, { kind: GroupKind.CHOIR, name: 'Denied', parentGroupId: null }),
    ).rejects.toBeInstanceOf(GroupManagementAuthorizationError)
  })
})

function createService() {
  return createGroupManagementService({
    groupStructure: createGroupStructure(persistence),
  })
}

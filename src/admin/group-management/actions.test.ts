import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupManagementValidationError } from '@/admin/group-management/service'
import type { AccessActor } from '@/lib/access-actor'
import { GroupKind } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const listGroupManagement = mock(async () => ({ groups: [], hierarchy: [] }))
const createGroup = mock(async () => ({ id: 'group-1' }))
const updateGroup = mock(async () => ({ id: 'group-1' }))
const requireAdminSurfaceActor = mock(async () => actor)
const actor: AccessActor = { id: 'admin-user', role: 'admin' }

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/shell/actor', () => ({
  getCurrentAccessActor: async () => actor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/group-management/runtime', () => ({
  getGroupManagementService: async () => ({
    listGroupManagement,
    createGroup,
    updateGroup,
  }),
}))

const { createGroupAction, updateGroupAction } = await import('@/admin/group-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  listGroupManagement.mockClear()
  createGroup.mockClear()
  updateGroup.mockClear()
  requireAdminSurfaceActor.mockClear()
})

describe('admin Group management actions', () => {
  test('creates a Group from form data and revalidates the admin workflow', async () => {
    const formData = groupFormData({
      name: ' CSK ',
      description: 'Main choir',
      kind: GroupKind.CHOIR,
      parentGroupId: '',
    })

    await expect(createGroupAction({}, formData)).resolves.toEqual({ message: 'Group created.' })
    expect(createGroup).toHaveBeenCalledWith(actor, {
      name: ' CSK ',
      description: 'Main choir',
      kind: GroupKind.CHOIR,
      parentGroupId: null,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
  })

  test('updates a Group from form data and revalidates the admin workflow', async () => {
    const formData = groupFormData({
      name: 'Altos',
      description: '',
      kind: GroupKind.SECTION,
      parentGroupId: 'group-parent',
    })

    await expect(updateGroupAction('group-1', {}, formData)).resolves.toEqual({ message: 'Group updated.' })
    expect(updateGroup).toHaveBeenCalledWith(actor, 'group-1', {
      name: 'Altos',
      description: null,
      kind: GroupKind.SECTION,
      parentGroupId: 'group-parent',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
  })

  test('returns useful duplicate sibling feedback from create and update validation', async () => {
    createGroup.mockImplementationOnce(async () => {
      throw new GroupManagementValidationError('A sibling Group named "Altos" already exists.', {
        name: 'A sibling Group named "Altos" already exists.',
      })
    })
    updateGroup.mockImplementationOnce(async () => {
      throw new GroupManagementValidationError('A sibling Group named "Altos" already exists.', {
        name: 'A sibling Group named "Altos" already exists.',
      })
    })

    await expect(
      createGroupAction(
        {},
        groupFormData({
          name: 'Altos',
          description: '',
          kind: GroupKind.SECTION,
          parentGroupId: 'choir-1',
        }),
      ),
    ).resolves.toEqual({
      message: 'A sibling Group named "Altos" already exists.',
      fieldErrors: {
        name: 'A sibling Group named "Altos" already exists.',
      },
    })
    await expect(
      updateGroupAction(
        'group-1',
        {},
        groupFormData({
          name: 'Altos',
          description: '',
          kind: GroupKind.SECTION,
          parentGroupId: 'choir-1',
        }),
      ),
    ).resolves.toEqual({
      message: 'A sibling Group named "Altos" already exists.',
      fieldErrors: {
        name: 'A sibling Group named "Altos" already exists.',
      },
    })
  })

  test('rejects direct non-admin create and update action requests before service writes', async () => {
    requireAdminSurfaceActor.mockImplementation(async () => {
      throw new Error('Forbidden')
    })

    const formData = groupFormData({
      name: 'Altos',
      description: '',
      kind: GroupKind.SECTION,
      parentGroupId: 'choir-1',
    })

    await expect(createGroupAction({}, formData)).rejects.toThrow('Forbidden')
    await expect(updateGroupAction('group-1', {}, formData)).rejects.toThrow('Forbidden')
    expect(createGroup).not.toHaveBeenCalled()
    expect(updateGroup).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

function groupFormData(input: { name: string; description: string; kind: GroupKind; parentGroupId: string }) {
  const formData = new FormData()
  formData.set('name', input.name)
  formData.set('description', input.description)
  formData.set('kind', input.kind)
  formData.set('parentGroupId', input.parentGroupId)
  return formData
}

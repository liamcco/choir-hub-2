import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { GroupKind } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const createGroup = mock(async () => ({ id: 'group-1' }))
const updateGroup = mock(async () => ({ id: 'group-1' }))

class OrganizationOperationError extends Error {
  constructor(
    message: string,
    readonly options: { field?: string } = {},
  ) {
    super(message)
  }
  get field() {
    return this.options.field
  }
}

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/organization', () => ({
  OrganizationOperationError,
  organizationService: {
    groups: {
      create: createGroup,
      update: updateGroup,
    },
  },
}))

const { createGroupAction, updateGroupAction } = await import('@/admin/group-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  createGroup.mockClear()
  updateGroup.mockClear()
})

describe('admin Group management actions', () => {
  test('creates a Group from form data and revalidates the admin workflow', async () => {
    const formData = groupFormData({
      name: ' CSK ',
      description: 'Main choir',
      kind: GroupKind.CHOIR,
      parentGroupId: '',
    })

    await expect(createGroupAction({}, formData)).resolves.toEqual({ success: true, message: 'Group created.' })
    expect(createGroup).toHaveBeenCalledWith({
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

    await expect(updateGroupAction('group-1', {}, formData)).resolves.toEqual({
      success: true,
      message: 'Group updated.',
    })
    expect(updateGroup).toHaveBeenCalledWith('group-1', {
      name: 'Altos',
      description: null,
      kind: GroupKind.SECTION,
      parentGroupId: 'group-parent',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
  })

  test('returns useful duplicate sibling feedback from create and update validation', async () => {
    createGroup.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('A sibling Group named "Altos" already exists.', {
        field: 'name',
      })
    })
    updateGroup.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('A sibling Group named "Altos" already exists.', {
        field: 'name',
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
      success: false,
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
      success: false,
      message: 'A sibling Group named "Altos" already exists.',
      fieldErrors: {
        name: 'A sibling Group named "Altos" already exists.',
      },
    })
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

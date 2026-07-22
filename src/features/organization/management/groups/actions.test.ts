import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OrganizationOperationError } from '@/features/organization/core/errors'
import { GroupKind } from '@/prisma/generated/client'

const revalidatePath = mock(() => {})
const redirect = mock(() => {})
const createGroup = mock(async () => ({ id: 'group-1' }))
const updateGroup = mock(async () => ({ id: 'group-1' }))
const requireAdminActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermissionActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath,
}))
mock.module('next/navigation', () => ({
  redirect,
  usePathname: () => '/admin/groups',
  useRouter: () => ({ back() {}, forward() {}, prefetch: async () => {}, push() {}, refresh() {}, replace() {} }),
}))

mock.module('@/core/auth/permissions.server', () => ({
  requireAdmin: requireAdminActor,
  requireCurrentUserPermission: requireCurrentUserPermissionActor,
}))
mock.module('@/core/logging', () => ({ audit: { adminActionCompleted, accountAccessChanged } }))

mock.module('@/features/organization', () => ({
  OrganizationOperationError,
  organizationService: {
    groups: {
      create: createGroup,
      update: updateGroup,
    },
  },
}))

const { createGroupAction, updateGroupAction } = await import('@/features/organization/management/groups/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  redirect.mockClear()
  createGroup.mockClear()
  updateGroup.mockClear()
  requireAdminActor.mockClear()
  adminActionCompleted.mockClear()
})

describe('admin Group management actions', () => {
  test('creates a Group from form data and revalidates the admin workflow', async () => {
    const formData = groupFormData({
      name: ' CSK ',
      description: 'Main choir',
      kind: GroupKind.CHOIR,
      parentGroupId: '',
    })

    await expect(createGroupAction({}, formData)).resolves.toEqual({
      success: true,
      message: 'Group successfully created.',
      createdId: 'group-1',
    })
    expect(createGroup).toHaveBeenCalledWith({
      name: ' CSK ',
      description: 'Main choir',
      kind: GroupKind.CHOIR,
      parentGroupId: null,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/groups')
    expect(redirect).not.toHaveBeenCalled()
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'group.create',
      subject: { type: 'group', id: 'group-1' },
    })
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

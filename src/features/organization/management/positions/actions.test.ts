import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OrganizationOperationError } from '@/features/organization/core/errors'

const revalidatePath = mock(() => {})
const redirect = mock(() => {})
const createPosition = mock(async () => ({ id: 'position-1' }))
const updatePosition = mock(async () => ({ id: 'position-1' }))
const requireAdminActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const requireCurrentUserPermissionActor = mock(async () => ({ state: 'authenticated' as const, userId: 'admin-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath,
}))
mock.module('next/navigation', () => ({
  redirect,
  usePathname: () => '/admin/positions',
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
    positions: {
      create: createPosition,
      update: updatePosition,
    },
  },
}))

const { createPositionAction, updatePositionAction } = await import(
  '@/features/organization/management/positions/actions'
)

beforeEach(() => {
  revalidatePath.mockClear()
  redirect.mockClear()
  createPosition.mockClear()
  updatePosition.mockClear()
  requireAdminActor.mockClear()
  adminActionCompleted.mockClear()
})

describe('admin Position management actions', () => {
  test('creates a Position from form data with multiple Group scopes', async () => {
    const formData = positionFormData({
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: ['group-1', 'group-2'],
    })

    await expect(createPositionAction({}, formData)).resolves.toEqual({
      success: true,
      message: 'Position successfully created.',
      createdId: 'position-1',
    })
    expect(createPosition).toHaveBeenCalledWith({
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: ['group-1', 'group-2'],
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
    expect(redirect).not.toHaveBeenCalled()
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'position.create',
      subject: { type: 'position', id: 'position-1' },
    })
  })

  test('updates a Position and can remove one Group scope without deleting the Position', async () => {
    const formData = positionFormData({
      name: 'Finance Lead',
      description: '',
      groupIds: ['group-2'],
    })

    await expect(updatePositionAction('position-1', {}, formData)).resolves.toEqual({
      success: true,
      message: 'Position updated.',
    })
    expect(updatePosition).toHaveBeenCalledWith('position-1', {
      name: 'Finance Lead',
      description: null,
      groupIds: ['group-2'],
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
  })

  test('returns useful scope validation feedback', async () => {
    createPosition.mockImplementationOnce(async () => {
      throw new OrganizationOperationError('Choose at least one Group.', {
        field: 'groupIds',
      })
    })

    await expect(
      createPositionAction(
        {},
        positionFormData({
          name: 'Chair',
          description: '',
          groupIds: [],
        }),
      ),
    ).resolves.toEqual({
      success: false,
      message: 'Choose at least one Group.',
      fieldErrors: {
        groupIds: 'Choose at least one Group.',
      },
    })
  })
})

function positionFormData(input: { name: string; description: string; groupIds: string[] }) {
  const formData = new FormData()
  formData.set('name', input.name)
  formData.set('description', input.description)
  for (const groupId of input.groupIds) {
    formData.append('groupIds', groupId)
  }
  return formData
}

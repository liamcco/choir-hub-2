import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { AccessActor } from '@/admin/access-policy'
import { PositionManagementValidationError } from '@/admin/position-management/service'

const revalidatePath = mock(() => {})
const listPositionManagement = mock(async () => ({ groups: [], positions: [] }))
const createPosition = mock(async () => ({ id: 'position-1' }))
const updatePosition = mock(async () => ({ id: 'position-1' }))
const requireAdminSurfaceActor = mock(async () => actor)
const actor: AccessActor = { id: 'admin-user', role: 'admin' }

mock.module('next/cache', () => ({
  revalidatePath,
}))

mock.module('@/admin/actor', () => ({
  getCurrentAccessActor: async () => actor,
  requireAdminSurfaceActor,
}))

mock.module('@/admin/position-management/runtime', () => ({
  getPositionManagementService: async () => ({
    listPositionManagement,
    createPosition,
    updatePosition,
  }),
}))

const { createPositionAction, updatePositionAction } = await import('@/admin/position-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  listPositionManagement.mockClear()
  createPosition.mockClear()
  updatePosition.mockClear()
  requireAdminSurfaceActor.mockClear()
})

describe('admin Position management actions', () => {
  test('creates a Position from form data with multiple Group scopes', async () => {
    const formData = positionFormData({
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: ['group-1', 'group-2'],
    })

    await expect(createPositionAction({}, formData)).resolves.toEqual({ message: 'Position created.' })
    expect(createPosition).toHaveBeenCalledWith(actor, {
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: ['group-1', 'group-2'],
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
  })

  test('updates a Position and can remove one Group scope without deleting the Position', async () => {
    const formData = positionFormData({
      name: 'Finance Lead',
      description: '',
      groupIds: ['group-2'],
    })

    await expect(updatePositionAction('position-1', {}, formData)).resolves.toEqual({ message: 'Position updated.' })
    expect(updatePosition).toHaveBeenCalledWith(actor, 'position-1', {
      name: 'Finance Lead',
      description: null,
      groupIds: ['group-2'],
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/positions')
  })

  test('returns useful scope validation feedback', async () => {
    createPosition.mockImplementationOnce(async () => {
      throw new PositionManagementValidationError('Choose at least one Group.', {
        groupIds: 'Choose at least one Group.',
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
      message: 'Choose at least one Group.',
      fieldErrors: {
        groupIds: 'Choose at least one Group.',
      },
    })
  })

  test('rejects direct non-admin create and update action requests before service writes', async () => {
    requireAdminSurfaceActor.mockImplementation(async () => {
      throw new Error('Forbidden')
    })

    const formData = positionFormData({
      name: 'Chair',
      description: '',
      groupIds: ['group-1'],
    })

    await expect(createPositionAction({}, formData)).rejects.toThrow('Forbidden')
    await expect(updatePositionAction('position-1', {}, formData)).rejects.toThrow('Forbidden')
    expect(createPosition).not.toHaveBeenCalled()
    expect(updatePosition).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
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

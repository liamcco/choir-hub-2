import { beforeEach, describe, expect, mock, test } from 'bun:test'

const revalidatePath = mock(() => {})
const createPosition = mock(async () => ({ id: 'position-1' }))
const updatePosition = mock(async () => ({ id: 'position-1' }))

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
    positions: {
      create: createPosition,
      update: updatePosition,
    },
  },
}))

const { createPositionAction, updatePositionAction } = await import('@/admin/position-management/actions')

beforeEach(() => {
  revalidatePath.mockClear()
  createPosition.mockClear()
  updatePosition.mockClear()
})

describe('admin Position management actions', () => {
  test('creates a Position from form data with multiple Group scopes', async () => {
    const formData = positionFormData({
      name: ' Chair ',
      description: 'Shared leadership',
      groupIds: ['group-1', 'group-2'],
    })

    await expect(createPositionAction({}, formData)).resolves.toEqual({ success: true, message: 'Position created.' })
    expect(createPosition).toHaveBeenCalledWith({
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
